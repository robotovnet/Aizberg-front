<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__content main__content--column">
			<div class="main__wrapper">
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.price_type_title') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.price_type_title_placeholder')"
						v-model="priceType.name"
						@input="removeError(errors?.errors['names.0.value'])" />
					<span class="main__error main__error-message" v-html="errors?.errors['names.0.value']" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.price_type_code') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.price_type_code_placeholder')"
						v-model="priceType.code"
						@input="removeError(errors?.errors.code)" />
					<span class="main__error main__error-message" v-html="errors?.errors.code" />
				</div>
				<div class="main__inner main__inner--end">
					<button v-if="isEditMode" class="btn" @click="saveOrUpdate('update')">
						{{ $t('text.price_type_button_update') }}
					</button>
					<button v-else class="btn" :disabled="disabled" @click="saveOrUpdate('save')">
						{{ $t('text.price_type_button_add') }}
					</button>
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
import priceTypesService from '../../../services/priceTypesService';
import '../../../extensions/Array';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const disabled = ref<boolean>(false);
const priceType = ref<any>({
	name: '',
	code: '',
});
const sendData = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: priceType.value.name,
		},
	],
	code: priceType.value.code,
}));
const { canEdit, canView, itemId, isEditMode } = usePageInit('pricetype');

let isClicked = false;
const { validate, errors, removeError } = useValidationHandler();
const errorNames = ['names.0.value', 'code'];

const { create, update } = useCreateOrUpdate(priceTypesService, errorNames, '/dashboard/price-types');

const saveOrUpdate = async selector => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};

watch(priceType.value, () => {
	disabled.value = false;
	// disabled.value = !(priceType.value.name && priceType.value.code);
});

onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/price-types');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	if (isEditMode.value) {
		await sleep(1);
		store.commit('setLoading', true);
		priceType.value = await priceTypesService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg));

		store.commit('setLoading', false);
	}
});
</script>
