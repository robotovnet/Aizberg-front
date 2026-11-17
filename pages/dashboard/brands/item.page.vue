<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__content main__content--column">
			<div class="main__wrapper">
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.name') }}</span>
					<input type="text" v-model="title" class="main__input input" @input="removeError(errors?.errors['names.0.value'])" />
					<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['names.0.value']" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.country_code') }}</span>
					<select class="main__select select" v-model="country_code" @change="removeError(errors?.errors.country_code)">
						<option :value="country.code" :key="country.id" v-for="country in countries">{{ country.code }}</option>
					</select>

					<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors.country_code" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.website') }}</span>
					<input type="text" v-model="website" class="main__input input" placeholder='https://domain.com/' @input="removeError(errors?.errors.official_website)" />
					<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors.official_website" />
				</div>

				<div class="main__inner main__inner--short main__inner--top">
					<span class="main__text">{{ $t('text.description') }}</span>
					<textarea
						v-model="description"
						class="main__textarea main__textarea--md textarea"
						@input="removeError(errors?.errors?.desc)"
						:placeholder="$t('text.description_placeholder')"></textarea>
					<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors.desc" />
				</div>
				<div class="main__inner main__inner--end">
					<label for="type-checkbox" class="checkbox-group">
						<span>{{ $t('text.is_hidden') }}</span>
						<input type="checkbox" id="type-checkbox" class="checkbox-group__checkbox" v-model="isHidden" />
						<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors.is_hidden" />
					</label>
				</div>
				<div class="main__inner main__inner--end">
					<button v-if="isEditMode" class="btn" @click="saveOrUpdate('update')">
						{{ $t('text.update') }}
					</button>
					<button v-else class="btn" @click="saveOrUpdate('save')">{{ $t('text.save') }}</button>
				</div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import countriesService from '../../../services/countriesService';
import '../../../extensions/Array';
import toaster from '../../../utils/toaster';
import brandsService from '../../../services/brandsService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import redirect from '../../../utils/redirect';

const store = useStore<MainState>();
const toast = inject('toast') as any;
const localization: any = useI18n();
const isDefault = ref<boolean>(false);
const brand = ref<any>();
const title = ref();
const country_code = ref();
const website = ref('');
const description = ref();
const isHidden = ref();
const countries = ref();

const errorNames = ['country_code', 'official_website', 'desc', 'is_hidden', 'names', 'names.0.value', 'brand_exist'];
let isClicked = false;
const { canEdit, canView, itemId, isEditMode } = usePageInit('catalog.brands');
const { validate, errors, removeError } = useValidationHandler();

const sendData = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: title.value,
		},
	],
	official_website: website.value,
	desc: description.value,
	is_hidden: isHidden.value ? 'Y' : 'N',
	country_code: country_code.value,
}));
const { create, update } = useCreateOrUpdate(brandsService, errorNames, '/dashboard/brands');

const saveOrUpdate = async selector => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};

onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/brands');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	store.commit('setLoading', true);
	countries.value = await countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
	if (isEditMode.value) {
		store.commit('setLoading', true);
		brand.value = await brandsService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg));
		country_code.value = brand.value.country_code.toLowerCase();
		title.value = brand.value.name;
		website.value = brand.value.official_website;
		description.value = brand.value.desc;
		isHidden.value = brand.value.is_hidden === 'Y';
		store.commit('setLoading', false);
	}
});
</script>
