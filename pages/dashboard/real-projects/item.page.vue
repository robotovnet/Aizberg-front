<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__content main__content--column">
			<div class="main__wrapper">
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.name') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.name_placeholder')"
						v-model="project.name"
						@input="removeError(errors?.errors?.name)" />
					<span class="main__error main__error-message" v-html="errors?.errors?.name" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.url') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.url_placeholder')"
						v-model="project.url"
						@input="removeError(errors?.errors?.url)" />
					<span class="main__error main__error-message" v-html="errors?.errors?.url" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.sort') }}</span>
					<input
						type="text"
						inputmode="numeric"
						class="auth-form__input input"
						:placeholder="$t('text.sort_placeholder')"
						:title="$t('text.sort_hint')"
						v-model="project.sort"
						@input="removeError(errors?.errors?.sort)" />
					<span class="main__error main__error-message" v-html="errors?.errors?.sort" />
				</div>
				<div class="main__inner main__inner--short real-project__banner-row">
					<span class="main__text">{{ $t('text.banner') }}</span>
					<div class="real-project__banner-field">
						<span v-if="bannerPreview" class="real-project__banner">
							<img :src="bannerPreview" :alt="project.name" />
						</span>
						<input
							type="file"
							ref="fileInput"
							:accept="BANNER_ACCEPT"
							@change="onBannerSelect"
							style="display: none;" />
						<button type="button" class="btn" @click="fileInput?.click()">
							{{ bannerPreview ? $t('text.banner_replace') : $t('text.banner_select') }}
						</button>
					</div>
					<span class="main__text real-project__hint">{{ bannerFile?.name || $t('text.banner_hint') }}</span>
					<span class="main__error main__error-message" v-html="errors?.errors?.banner" />
				</div>
				<div class="main__inner main__inner--end" style="margin-top: 18px;">
					<button v-if="isEditMode" class="btn" @click="saveOrUpdate('update')">
						{{ $t('text.button_update') }}
					</button>
					<button v-else class="btn" @click="saveOrUpdate('save')">
						{{ $t('text.button_add') }}
					</button>
				</div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, onBeforeMount, onBeforeUnmount } from 'vue';
import { MainState } from '../../../store/mainStore';
import realProjectsService from '../../../services/realProjectsService';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import getValidator from '../../../validation/getValidator';
import filterValidation from '../../../validation/filterValidation';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
import { getApiUrl } from '../../../utils/constants';

const BANNER_EXTENSIONS = ['svg', 'png', 'jpg', 'jpeg', 'webp'];
const BANNER_ACCEPT = BANNER_EXTENSIONS.map(ext => `.${ext}`).join(',');

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const project = ref<any>({
	name: '',
	url: '',
	sort: '',
});
const bannerFile = ref<File | null>(null);
const bannerPreview = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
let objectUrl: string | null = null;

const { canEdit, itemId, isEditMode } = usePageInit('realprojects');
const { errors, removeError } = useValidationHandler();
const errorNames = ['name', 'url', 'sort', 'banner'];
const { create, update } = useCreateOrUpdate(realProjectsService, errorNames, '/dashboard/real-projects');

const setBannerError = (message: string) => {
	errors.value = { errors: { ...(errors.value?.errors || {}), banner: [message] } };
};

const onBannerSelect = (event: Event) => {
	const file = (event.target as HTMLInputElement).files?.[0];
	if (!file) return;

	const extension = file.name.split('.').pop()?.toLowerCase() || '';
	if (!BANNER_EXTENSIONS.includes(extension)) {
		setBannerError(localization.t('text.banner_wrong_type'));
		return;
	}

	removeError(errors.value?.errors?.banner);
	bannerFile.value = file;
	if (objectUrl) URL.revokeObjectURL(objectUrl);
	objectUrl = URL.createObjectURL(file);
	bannerPreview.value = objectUrl;
};

// Правила приходят с бэкенда; banner проверяется вручную — validatorjs не знает правил file/mimes
const validate = (): boolean => {
	const data = {
		name: project.value.name,
		url: project.value.url,
		sort: project.value.sort === null ? '' : String(project.value.sort),
	};
	const validator: any = getValidator(data, filterValidation(['banner'], store.state.currentValidation));
	const isValid = !validator || validator.passes();
	errors.value = isValid ? { errors: {} } : validator.errors;

	if (!isEditMode.value && !bannerFile.value) {
		setBannerError(localization.t('text.banner_required'));
		return false;
	}

	return isValid;
};

const buildFormData = (): FormData => {
	const formData = new FormData();
	formData.append('name', project.value.name.trim());
	formData.append('url', project.value.url.trim());
	formData.append('sort', project.value.sort === null ? '' : String(project.value.sort).trim());
	if (bannerFile.value) formData.append('banner', bannerFile.value);
	return formData;
};

const saveOrUpdate = async (selector: string) => {
	if (!validate()) return;

	return selector === 'save' ? await create(buildFormData()) : await update(itemId.value, buildFormData());
};

onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/real-projects');
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	if (isEditMode.value) {
		await sleep(1);
		store.commit('setLoading', true);
		const response: any = await realProjectsService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg));
		if (response?.id) {
			project.value = { name: response.name, url: response.url, sort: response.sort };
			bannerPreview.value = /^(https?:)?\/\//i.test(response.banner_url)
				? response.banner_url
				: getApiUrl().replace(/\/+$/, '') + response.banner_url;
		}
		store.commit('setLoading', false);
	}
});

onBeforeUnmount(() => {
	if (objectUrl) URL.revokeObjectURL(objectUrl);
});
</script>

<style scoped>
.main__inner+.main__inner {
	margin-top: 0px;
}

.main__inner.real-project__banner-row {
	margin-top: 18px;
}

.real-project__banner-field {
	display: flex;
	align-items: center;
	gap: 12px;
}

.real-project__banner {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 240px;
	height: 80px;
	padding: 8px 16px;
	border-radius: 4px;
	/* Логотипы на сайте выводятся на тёмном фоне, поэтому светлые SVG должны быть видны и здесь */
	background: #1b1b1b;
}

.real-project__banner img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.real-project__hint {
	margin-top: 6px;
	opacity: 0.85;
	font-size: 0.95em;
}
</style>
