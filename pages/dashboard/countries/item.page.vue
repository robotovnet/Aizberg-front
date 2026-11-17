<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" v-if="canEdit">
		<div class="main__content main__content--column">
			<div class="main__wrapper">
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.country_title') }}</span>
					<input
						type="text"
						v-model="country.name"
						class="main__input input"
						@input="removeError(errors?.errors['names.0.value'])" />
					<span class="main__error main__error-message" v-html="errors?.errors['names.0.value']" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.country_code') }}</span>
					<input type="text" v-model="country.code" class="main__input input" @input="removeError(errors?.errors.code)" />
					<span class="main__error main__error-message" v-html="errors?.errors.code" />
				</div>
				<div class="main__inner main__inner--end">
					<label for="type-checkbox" class="checkbox-group">
						<span>{{ $t('text.country_default') }}</span>
						<input type="checkbox" id="type-checkbox" class="checkbox-group__checkbox" v-model="isDefault" />
					</label>
				</div>
				<div class="main__inner main__inner--end">
					<button v-if="isEditMode" class="btn" @click="saveOrUpdate('update')">{{ $t('text.country_button_update') }}</button>
					<button v-else class="btn" @click="saveOrUpdate('save')">
						{{ $t('text.country_button_add') }}
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
import redirect from '../../../utils/redirect';
import '../../../extensions/Array';
import viewPermissions from '../../../utils/viewPermissions';
import getValidator from '../../../validation/getValidator';
import toaster from '../../../utils/toaster';
import countriesService from '../../../services/countriesService';
import sleep from '../../../utils/sleep';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import shopsService from '../../../services/shopsService';

const store = useStore<MainState>();
const toast = inject('toast') as any;
const localization: any = useI18n();
const isDefault = ref<boolean>(false);
const country = ref<any>({
	name: '',
	code: '',
});

const errorNames = ['code', 'is_default', 'language', 'names'];
let isClicked = false;
const { canEdit, canView, itemId, isEditMode } = usePageInit('country');
const { validate, errors, removeError } = useValidationHandler();

const sendData = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: country.value.name,
		},
	],
	code: country.value.code,
	language: localization.locale.value,
	is_default: isDefault.value ? 'Y' : 'N',
}));
const { create, update } = useCreateOrUpdate(countriesService, errorNames, '/dashboard/countries');

const saveOrUpdate = async selector => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};
onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/countries');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	if (isEditMode.value) {
		await sleep(1);
		store.commit('setLoading', true);
		const fetchedCountry: any = await countriesService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg));
		country.value = { code: fetchedCountry.code, name: fetchedCountry.name };

		isDefault.value = fetchedCountry.is_default === 'Y';
		store.commit('setLoading', false);
	}
});
</script>
