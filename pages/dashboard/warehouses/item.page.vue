<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.name') }}</span>
				<input
					v-model="names"
					type="text"
					class="main__input input"
					:placeholder="$t('text.name_placeholder')"
					@input="removeError(errors?.errors['names.0.value'])" />
				<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['names.0.value']" />
			</div>
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors?.errors?.label_1c"
					v-model="label1c"
					:title="$t('text.mark_1c')"
					:placeholder="$t('text.mark_1c_placeholder')"
					@validate="removeError(errors?.errors?.label_1c)"></app-page-input>
			</div>
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors?.errors?.code"
					v-model="code"
					:title="$t('text.code_1c')"
					:placeholder="$t('text.code_1c_placeholder')"
					@validate="removeError(errors?.errors?.code)"></app-page-input>
			</div>
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors?.errors?.priority"
					v-model="priority"
					:title="$t('text.priority')"
					:placeholder="'1'"
					@validate="removeError(errors?.errors?.priority)"></app-page-input>
			</div>
			<div class="main__inner main__inner--short main__inner--top">
				<span class="main__text">{{ $t('text.transport_companies_list') }}</span>
				<div class="main__block">
					<div class="main__column main__column--start">
						<div
							:key="company.transport_company_id"
							class="main__checkboxes main__checkboxes--subgroup"
							v-for="(company, index) in transportCompanies">
							<label class="checkbox-group">
								<input
									@click="setDeliveryCheckBoxes(company, index)"
									type="checkbox"
									class="checkbox-group__checkbox"
									v-model="company.transport_company_checkbox"
									@change="refreshSendData(null)" />
								<span>{{ company.transport_company_name }}</span>
							</label>
							<label class="checkbox-group">
								<input
									type="checkbox"
									class="checkbox-group__checkbox"
									v-model="company.for_all_courier_cities"
									@change="refreshSendData(company)" />
								<span>{{ $t('text.all_cities') }}</span>
							</label>
							<label class="checkbox-group">
								<input
									type="checkbox"
									class="checkbox-group__checkbox"
									v-model="company.for_all_pickup_points"
									@change="refreshSendData(company)" />
								<span>{{ $t('text.all_pickup_points') }}</span>
							</label>
							<label class="checkbox-group">
								<input
									type="checkbox"
									class="checkbox-group__checkbox"
									v-model="company.for_all_postamats"
									@change="refreshSendData(company)" />
								<span>{{ $t('text.all_postomats') }}</span>
							</label>
						</div>
					</div>
					<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors.transport_companies" />
				</div>
			</div>
			<div class="main__inner main__inner--end">
				<button v-if="isEditMode" @click="saveOrUpdate('update')" class="btn">{{ $t('text.edit') }}</button>
				<button v-else @click="saveOrUpdate('save')" class="btn">{{ $t('text.add') }}</button>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import redirect from '../../../utils/redirect';
import toaster from '../../../utils/toaster';
import transportCompaniesService from '../../../services/transportCompaniesService';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import warehousesService from '../../../services/warehousesService';
import AppPageInput from '../../_components/AppPageInput.vue';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const companies = ref();
const warehouse = ref();
const names = ref();
const label1c = ref();
const code = ref();
const priority = ref();

const transportCompanies = ref([
	{
		transport_company_checkbox: false,
		transport_company_id: 0,
		transport_company_name: '',
		for_all_courier_cities: false,
		for_all_postamats: false,
		for_all_pickup_points: false,
	},
]);
const setTkCheckBoxes = company => {
	const comp: any = transportCompanies.value.find(tc => tc.transport_company_id === company.transport_company_id);
	if (comp.for_all_courier_cities) {
		comp.transport_company_checkbox = true;
		return;
	}
	if (comp.for_all_pickup_points) {
		comp.transport_company_checkbox = true;
		return;
	}
	if (comp.for_all_postamats) {
		comp.transport_company_checkbox = true;
		return;
	}
	if (!comp.for_all_courier_cities && !comp.for_all_pickup_points && !comp.for_all_postamats) {
		comp.transport_company_checkbox = false;
	}
};
const setDeliveryCheckBoxes = (company, index) => {
	if (!transportCompanies.value[index].transport_company_checkbox) {
		transportCompanies.value[index].for_all_courier_cities = true;
		transportCompanies.value[index].for_all_pickup_points = true;
		transportCompanies.value[index].for_all_postamats = true;
	} else {
		transportCompanies.value[index].for_all_courier_cities = false;
		transportCompanies.value[index].for_all_pickup_points = false;
		transportCompanies.value[index].for_all_postamats = false;
	}
};
const { canEdit, canView, itemId, isEditMode } = usePageInit('transportcompany.warehouses');

const { errors, validate, removeError } = useValidationHandler();
const errorNames = ['code', 'is_active', 'label_1c', 'names', 'names.0.value', 'priority', 'transport_companies'];
const sendData = ref();
const refreshSendData = company => {
	if (company) setTkCheckBoxes(company);

	validate(isClicked, sendData.value);
	sendData.value = {
		names: [
			{
				lang: localization.locale.value,
				value: names.value,
			},
		],
		label_1c: label1c.value,
		code: code.value,
		priority: +priority.value,
		is_active: 'Y',
		transport_companies: transportCompanies.value
			.filter(company => company.transport_company_checkbox)
			.map(item => ({
				for_all_courier_cities: item.for_all_courier_cities ? 'Y' : 'N',
				for_all_pickup_points: item.for_all_pickup_points ? 'Y' : 'N',
				for_all_postamats: item.for_all_postamats ? 'Y' : 'N',
				transport_company_id: item.transport_company_id,
			})),
	};
};

watch(
	() => transportCompanies.value,
	() => {
		if (errors.value) {
			errors.value.errors.transport_companies = null;
		}
	},
	{ deep: true },
);
onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/warehouses');
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		isEditMode.value ? warehousesService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : [],
	])
		.then(values => ([companies.value, warehouse.value] = [...values]))
		.then(() => {
			const urlParams = new URLSearchParams(window.location.search);
			itemId.value = urlParams.get('edit');
			isEditMode.value = !!itemId.value;
			document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
			if (isEditMode.value) {
				names.value = warehouse.value.name;
				label1c.value = warehouse.value.label_1c;
				code.value = warehouse.value.code;
				priority.value = warehouse.value.priority;
				const warehouseTransportCompanies = warehouse.value.transport_companies;
				transportCompanies.value = companies.value.map(company => {
					const transportCompany = warehouseTransportCompanies.find(item => item.id === company.id);
					return {
						transport_company_checkbox: transportCompany ? !!transportCompany : false,
						transport_company_id: company.id,
						transport_company_name: company.name,
						for_all_courier_cities: transportCompany?.pivot.for_all_courier_cities === 'Y',
						for_all_pickup_points: transportCompany?.pivot.for_all_pickup_points === 'Y',
						for_all_postamats: transportCompany?.pivot.for_all_postamats === 'Y',
					};
				});
			} else {
				transportCompanies.value = companies.value.map(company => ({
					transport_company_checkbox: false,
					transport_company_id: company.id,
					transport_company_name: company.name,
					for_all_courier_cities: false,
					for_all_pickup_points: false,
					for_all_postamats: false,
				}));
			}
		})
		.then(() => store.commit('setLoading', false));
});

const { create, update } = useCreateOrUpdate(warehousesService, errorNames, '/dashboard/warehouses');
let isClicked = false;
const saveOrUpdate = async selector => {
	isClicked = true;
	refreshSendData(null);
	validate(isClicked, sendData.value);
	if (validate(isClicked, sendData.value)) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};
</script>
