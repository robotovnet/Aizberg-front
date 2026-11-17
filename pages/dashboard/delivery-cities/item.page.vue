<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :can-edit="canEdit" v-if="canEdit">
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.country') }}</span>
				<select
					class="main__select select"
					v-model="countryId"
					@change="
						selectCity(countryId);
						removeError(errors?.errors?.country_id);
					">
					<option value="0" disabled selected>{{ $t('text.country_placeholder') }}</option>
					<option :value="country.id" v-for="country in countries">{{ country.name }}</option>
				</select>
				<span class="main__error main__error-message" v-html="errors?.errors?.country_id" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.city') }}</span>
				<select class="main__select select" v-model="cityId" @change="removeError(errors?.errors?.city_id)">
					<option value="0" disabled selected>{{ $t('text.city_placeholder') }}</option>
					<option :value="city.id" v-for="city in cities">{{ city.name }}</option>
				</select>
				<span class="main__error main__error-message" v-html="errors?.errors?.city_id" />
			</div>
			<div class="main__inner main__inner--short main__inner--top">
				<span class="main__text">{{ $t('text.transport_companies_list') }}</span>
				<div class="main__block main__block--double-checkbox">
					<label class="checkbox-group" v-for="(company, idx) in transportCompanies" :key="idx">
						<input
							v-if="transportCompaniesModel[idx]"
							v-model="transportCompaniesModel[idx].condition"
							class="checkbox-group__checkbox"
							type="checkbox"
							@change="removeError(errors?.errors?.transport_companies)" />
						<span>{{ company.name }}</span>
					</label>
				</div>
				<span class="main__error main__error-message" v-html="errors?.errors?.transport_companies" />
			</div>
			<div class="main__inner main__inner--short main__inner--top">
				<span class="main__text">{{ $t('text.shipment_from_warehouse') }}</span>
				<div class="main__block main__block--double-checkbox">
					<label class="checkbox-group" v-for="(warehouse, idx) in warehouses" :key="idx">
						<input
							v-if="warehousesModel[idx]"
							v-model="warehousesModel[idx].condition"
							class="checkbox-group__checkbox"
							type="checkbox"
							@change="removeError(errors?.errors?.warehouses)" />
						<span>{{ warehouse.name }}</span>
					</label>
				</div>
				<span class="main__error main__error-message" v-html="errors?.errors?.warehouses" />
			</div>

			<div class="main__inner main__inner--end">
				<button v-if="isEditMode" @click="saveOrUpdate('update')" class="btn mt-25">{{ $t('text.edit') }}</button>
				<button v-else :disabled="canSave" @click="saveOrUpdate('save')" class="btn mt-25">{{ $t('text.add') }}</button>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import deliveryCitiesService from '../../../services/deliveryCitiesService';
import toaster from '../../../utils/toaster';
import citiesService from '../../../services/citiesService';
import transportCompaniesService from '../../../services/transportCompaniesService';
import warehousesService from '../../../services/warehousesService';
import countriesService from '../../../services/countriesService';
import { ADDING_METHOD_MANUAL } from '../../../utils/constants';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import sleep from '../../../utils/sleep';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization = useI18n();
const store = useStore<MainState>();
const loaded = ref<boolean>(false);
const transportCompanies = ref();
const warehouses = ref();
const cityId = ref(0);
const cities = ref();
const countries = ref();
const countryId = ref<any>(0);
const deliveryCity = ref();
const transportCompaniesModel = ref([
	{
		condition: '',
		id: 0,
	},
]);
const warehousesModel = ref([
	{
		condition: '',
		id: 0,
	},
]);
const errorNames = ['adding_method', 'city_id', 'country_id', 'transport_companies', 'warehouses'];
const { canEdit, canView, itemId, isEditMode } = usePageInit('transportcompany');
const { validate, errors, removeError } = useValidationHandler();
const sendData = computed(() => ({
	country_id: countryId.value,
	city_id: cityId.value,
	adding_method: ADDING_METHOD_MANUAL,
	warehouses: warehousesModel.value.filter(warehouse => warehouse.condition).map(item => item.id) as any,
	transport_companies: transportCompaniesModel.value.filter(company => company.condition).map(item => item.id) as any,
}));
const { create, update } = useCreateOrUpdate(deliveryCitiesService, errorNames, '/dashboard/delivery-cities');
let isClicked = false;
const saveOrUpdate = async selector => {
	isClicked = true;
	if (validate(isClicked, sendData.value))
		selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
};

const fetchedCities = ref();

onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/delivery-cities');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');

	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		warehousesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		isEditMode.value ? deliveryCitiesService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : [],
	])
		.then(
			values =>
				([countries.value, fetchedCities.value, transportCompanies.value, warehouses.value, deliveryCity.value] = [...values]),
		)
		.then(() => {
			transportCompaniesModel.value = transportCompanies.value.map(item => ({
				condition: false,
				id: item.id,
			}));
			warehousesModel.value = warehouses.value.map(item => ({
				condition: false,
				id: item.id,
			}));
			if (isEditMode.value) {
				countryId.value = deliveryCity.value.country_id;
				const country = countries.value.find(
					country => country.id === countries.value.find(country => country.id === countryId.value).id,
				);
				cities.value = fetchedCities.value.filter(city => city.country_code === country.code);
				cityId.value = deliveryCity.value.city_id || 0;

				transportCompaniesModel.value = transportCompanies.value.map(item => ({
					condition: deliveryCity.value.transport_companies.filter(tk => tk.id === item.id).length
						? !!deliveryCity.value.transport_companies.filter(tk => tk.id === item.id)[0]
						: false,
					id: item.id,
				}));
				warehousesModel.value = warehouses.value.map(item => ({
					condition: deliveryCity.value.warehouses.filter(tk => tk.id === item.id).length
						? !!deliveryCity.value.warehouses.filter(tk => tk.id === item.id)[0]
						: false,
					id: item.id,
				}));
			}
			store.commit('setLoading', false);
		});
});

const selectCity = countryId => {
	const country = countries.value.find(country => country.id === countryId);
	cities.value = fetchedCities.value.filter(city => city.country_code === country.code);
	cityId.value = 0;
};
onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
