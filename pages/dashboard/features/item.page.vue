<template>
	<AppPage :title="isEditMode ? $t('text.edit_param') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__sub"></div>
		<div class="main__content main__content--column">
			<div class="main__wrapper">
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.parameter_name') }} </span>
					<input
						v-model="parameterName"
						type="text"
						class="main__input input"
						:placeholder="$t('text.parameter_name_placeholder')"
						@input="removeError(errors?.errors['names.0.value'])" />
					<p v-if="errors?.errors" v-for="error in errors?.errors['names.0.value']" class="main__error">{{ error }}</p>
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.measure') }}</span>
					<input
						v-model="parameterMeasure"
						type="text"
						class="main__input input"
						:placeholder="$t('text.measure_placeholder')"
						@input="removeError(errors?.errors['units.0.value'])" />
					<p v-if="errors?.errors" v-for="error in errors?.errors['units.0.value']" class="main__error">{{ error }}</p>
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.parameter_type') }} </span>
					<select class="main__select select" v-model="parameterType" @change="removeError(errors?.errors['type'])">
						<option value="default" disabled>{{ $t('text.parameter_type_placeholder') }}</option>
						<option :value="parameterType.value" v-for="parameterType in parameterTypes" :key="parameterType.id">
							{{ parameterType.name }}
						</option>
					</select>
					<p v-if="errors?.errors" v-for="error in errors?.errors.type" class="main__error">{{ error }}</p>
				</div>

				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.parameter_sort_type') }}</span>
					<select class="main__select select" v-model="sortType" @change="removeError(errors?.errors['sort_type'])">
						<option value="default" disabled>{{ $t('text.parameter_sort_type_placeholder') }}</option>
						<option :value="sortType.value" v-for="sortType in sortTypes" :key="sortType.id">
							{{ sortType.name }}
						</option>
					</select>
					<p v-if="errors?.errors" v-for="error in errors?.errors.sort_type" class="main__error">{{ error }}</p>
				</div>

				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.value_separator') }}</span>
					<input
						v-model="valueSeparator"
						type="text"
						class="main__input input"
						:placeholder="$t('text.value_separator_placeholder')"
						maxlength="10"
						@input="removeError(errors?.errors['value_separator'])" />
					<p v-if="errors?.errors" v-for="error in errors?.errors['value_separator']" class="main__error">{{ error }}</p>
				</div>

				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.used_for_product_groups') }}</span>
					<div style='text-align: left; width: 70%; margin-left: 19px;'>
						<span v-for="(group, key, index) in usedForProductGroups">
							<a :href="`/dashboard/product-types/item?edit=${key}`">{{ group }}</a>
							<span v-if="index < Object.keys(usedForProductGroups).length - 1">, </span>
						</span>
					</div>
					<p></p>
				</div>
				
				<div class="main__inner main__inner--end">
					<button v-if="isEditMode" @click="saveOrUpdate('update')" class="btn">{{ $t('text.update') }}</button>
					<button v-else @click="saveOrUpdate('save')" class="btn">{{ $t('text.add') }}</button>
				</div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import redirect from '../../../utils/redirect';
import toaster from '../../../utils/toaster';
import catalogFeaturesService from '../../../services/catalogFeaturesService';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const parameterName = ref();
const parameterMeasure = ref();
const parameterType = ref('default');
const sortType = ref('default');
const valueSeparator = ref();
const isForAllGroups = ref(false);
const usedForProductGroups = ref([]);
const sortTypes = ref([
	{
		name: localization.t('text.like_numbers'),
		value: 'numerical',
	},
	{
		name: localization.t('text.like_strings'),
		value: 'string',
	},
]);
const parameterTypes = ref([
	{
		name: localization.t('text.input'),
		value: 'only_input',
	},
	{
		name: localization.t('text.radio'),
		value: 'radio',
	},
	{
		name: localization.t('text.checkbox'),
		value: 'checkbox',
	},
]);
const errorNames = ['names.0.value', 'units.0.value', 'type', 'units', 'is_for_all_groups', 'feature_exist', 'value_separator'];

const sendData = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: parameterName.value,
		},
	],
	units: [
		{
			lang: localization.locale.value,
			value: parameterMeasure.value,
		},
	],
	is_for_all_groups: isForAllGroups.value ? 'Y' : 'N',
	type: parameterType.value,
	sort_type: sortType.value,
	value_separator: valueSeparator.value || null,
}));

const { canEdit, canView, itemId, isEditMode } = usePageInit('catalog.features');
const { validate, errors, removeError } = useValidationHandler();

const { create, update } = useCreateOrUpdate(catalogFeaturesService, errorNames, '/dashboard/features');

let isClicked = false;

const saveOrUpdate = async selector => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		// eslint-disable-next-line no-unused-expressions
		selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};

onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/features');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.edit_param') : ' - ' + localization.t('text.header');
	if (isEditMode.value) {
		await sleep(1);
		store.commit('setLoading', true);
		const parameter: any = await catalogFeaturesService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg));
		store.commit('setLoading', false);
		parameterName.value = parameter.name;
		parameterMeasure.value = parameter.unit;
		parameterType.value = parameter.type;
		sortType.value = parameter.sort_type;
		valueSeparator.value = parameter.value_separator || null;
		usedForProductGroups.value = parameter.used_for_product_groups;
		isForAllGroups.value = parameter.is_for_all_groups === 'Y';
	}
});
</script>
