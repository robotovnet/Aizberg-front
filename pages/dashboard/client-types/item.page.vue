<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<form class="auth-form">
			<div class="auth-form__wrapper">
				<input
					type="text"
					class="auth-form__input input"
					:placeholder="$t('text.client_type_title_placeholder')"
					v-model="clientType.name"
					@input="validate" />
				<span v-if="errors?.errors['names.0.value']" class="auth-form__error" v-html="errors?.errors['names.0.value']" />
				<select
					class="auth-form__select select"
					:class="{ 'select--error': !!errors?.errors?.priceTypes }"
					v-model="currentPriceType"
					@change="validate">
					<option value="null" disabled>Тип цен</option>
					<option
						:key="idx"
						:value="group.id"
						v-for="(group, idx) in priceTypes.map(item => {
							return { id: item.id, name: item.name };
						})">
						{{ group.name }}
					</option>
				</select>
				<label for="type-checkbox" class="checkbox-group auth-form__label">
					<span>{{ $t('text.client_type_default') }}</span>
					<input type="checkbox" id="type-checkbox" class="checkbox-group__checkbox" v-model="isDefault" />
				</label>
				<button v-if="!isEditMode" :disabled="disabled" @click.prevent="saveOrUpdate('save')" class="auth-form__btn btn">
					{{ $t('text.client_type_button_add') }}
				</button>
				<button v-else @click.prevent="saveOrUpdate('update')" :disabled="disabled" class="auth-form__btn btn">
					{{ $t('text.client_type_button_update') }}
				</button>
			</div>
		</form>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import clientTypesService from '../../../services/clientTypesService';

import '../../../extensions/Array';
import priceTypesService from '../../../services/priceTypesService';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
const priceTypes = ref<any>([]);
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const disabled = ref<boolean>(true);
const clientType = ref<any>({
	is_default: '',
	price_type_id: '',
	name: '',
});
const currentPriceType = ref(null);
const isDefault = ref(false);

const errorNames = ['names.0.value'];
let isClicked = false;
const { canEdit, canView, itemId, isEditMode } = usePageInit('clienttype');
const { validate, errors, removeError } = useValidationHandler();

const sendData = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: clientType.value.name,
		},
	],
	price_type_id: currentPriceType.value,
	is_default: isDefault.value ? 'Y' : 'N',
}));
const { create, update } = useCreateOrUpdate(clientTypesService, errorNames, '/dashboard/client-types');

const saveOrUpdate = async selector => {
	isClicked = true;

	if (validate(isClicked, sendData.value)) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};

watch(clientType.value, () => {
	disabled.value = !(clientType.value.name && currentPriceType.value);
});

watch(
	() => currentPriceType.value,
	() => {
		disabled.value = !(clientType.value.name && currentPriceType.value);
	},
);

onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/client-types');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	await sleep(1);
	store.commit('setLoading', true);
	const promise = Promise.all([
		priceTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		isEditMode.value ? clientTypesService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : [],
	])
		.then(values => ([priceTypes.value, clientType.value] = [...values]))
		.then(() => {
			disabled.value = true;
			if (isEditMode.value) {
				isDefault.value = clientType.value.is_default === 'Y';
				currentPriceType.value = clientType.value.price_type?.id;
			}
		})
		.then(() => store.commit('setLoading', false));
});
</script>
