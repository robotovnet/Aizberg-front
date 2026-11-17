<template>
	<AppPage
		:button-text="$t('text.add_transport_company_button')"
		:title="$t('text.header')"
		:handler="() => redirect('/dashboard/transport-companies/create')"
		v-if="canView"
		:can-edit="canEdit">
		<div class="list list--three list--photo list--background">
			<div class="list__topping">
				<div class="list__heading" style="max-width: 60px;">{{ $t('text.table_transport_companies_order_header') }}</div>
				<span class="list__heading">{{ $t('text.table_transport_companies_name_header') }}</span>
				<span class="list__heading">{{ $t('text.table_transport_companies_toggle') }}</span>
				<span class="list__heading">{{ $t('text.table_transport_companies_remove') }}</span>
			</div>
			<template :key="company.id" v-for="(company, index) in companies">
				<div>
					<div class="list__item">
						<div class="list__elem" style='max-width: 60px;'>
							<select 
								@change="updateOrderCompanies(company, $event, null)"
								class="main__select select">
								<option v-for="(, indx) in companies" 
									:selected="(indx+1)==company.order"
									:value="(indx + 1)">{{ (indx + 1) }}</option>
							</select>
							<div style='text-align: center; margin-top: 8px;'>
								<span @click="updateOrderCompanies(company, $event, index)" style='cursor: pointer; padding: 5px; display: inline-block;'><img src='../../../assets/img/arrow_order.svg' :alt="$t('text.parameter_up')" :title="$t('text.parameter_up')" style='transform:rotate(180deg);' /></span>
								<span @click="updateOrderCompanies(company, $event, index+2)" style='cursor: pointer; padding: 5px; display: inline-block;'><img src='../../../assets/img/arrow_order.svg' :alt="$t('text.parameter_down')" :title="$t('text.parameter_down')" style='margin-left: 6px;' /></span>
							</div>
						</div>
						<div class="list__elem">
							<button
								:disabled="!canEdit"
								class="list__edit"
								:title="$t('text.table_transport_companies_edit')"
								@click="redirect(`/dashboard/transport-companies/edit/${company.id}`)"></button>
							<span>{{ company.name }}</span>
						</div>

						<span class="list__elem">
							<button
								:disabled="!canEdit"
								@click="toggleOnOff(company)"
								class="dot"
								:class="{ 'dot--red': company?.is_active === 'N', 'dot--green': company?.is_active === 'Y' }"
								:title="
									company?.is_active === 'N'
										? $t('text.table_transport_companies_turn_on')
										: $t('text.table_transport_companies_turn_off')
								"></button>
						</span>
						<span class="list__elem">
							<button
								:disabled="!canEdit"
								class="cross"
								@click="onConfirmDelete(company?.id, company?.name)"
								:title="$t('text.table_transport_companies_remove')"></button>
						</span>
					</div>
				</div>
			</template>
		</div>
		<AskDialog
			:deleteId="itemId?.toString()"
			:title="$t('text.dialog_delete_title')"
			:question="$t('text.dialog_delete_question') + '&quot;' + itemName + '&quot;' + '?'"
			:onConfirm="onDelete" />
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import viewPermissions from '../../../utils/viewPermissions';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import toaster from '../../../utils/toaster';
import AskDialog from '../../_components/AskDialog.vue';
import transportCompaniesService from '../../../services/transportCompaniesService';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();

const companies = ref([
	{
		accept_orders_completion_time: '',
		accept_orders_start_time: '',
		additional_comment: '',
		code: '',
		icon_path: '',
		id: '',
		is_active: '',
		is_support_courier_delivery: '',
		is_support_pickup_points: '',
		is_support_postamats: '',
		minimum_order_value_courier: '',
		minimum_order_value_pickup: '',
		name: '',
		order: '',
	},
]);
const { canEdit, canView } = usePageInit('transportcompany');
onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	companies.value = await transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
});

const updateOrderCompanies = async (company_item, event, pos) => {
	if (canEdit.value) {
		const totalItems = companies.value.length;
		const tempArr = companies.value.filter(company => company.id !== company_item.id);
		
		if (pos == null) {
			tempArr.splice(event.target.value - 1, 0, company_item);
		} else {
			if (pos == 0) {
				pos = totalItems;
			}
	
			if (pos > totalItems) {
				pos = 1;
			}
	
			tempArr.splice(pos - 1, 0, company_item);
		}
	
		tempArr.forEach((item, index) => (item.order = (index + 1).toString()));
		companies.value = tempArr;
		
		await sort();
	}
};
	
const sort = async () => {
	const sortData = companies.value.map(company => ({
		tcId: company.id,
		order: company.order,
	}));
	store.commit('setLoading', true);
	await transportCompaniesService.sort(localization, { orders: sortData }, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
};
const toggleOnOff = async company => {
	if (company) {
		const tmpCompany: any = { ...company };
		tmpCompany.is_active = company.is_active === 'Y' ? 'N' : 'Y';
		tmpCompany.names = [
			{
				lang: localization.locale.value,
				value: company.name,
			},
		];
		tmpCompany.additional_comments = [
			{
				lang: localization.locale.value,
				value: company.additional_comment,
			},
		];
		store.commit('setLoading', true);
		await transportCompaniesService.update(localization, company.id, tmpCompany, errMsg => {
			toaster.error(toast, errMsg);
		});
		const response = await transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
		companies.value = [...response];
		store.commit('setLoading', false);
	}
};

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(transportCompaniesService);
watch(
	() => marker.value,
	async () => (companies.value = await transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg))),
);

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
