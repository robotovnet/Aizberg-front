<template>
	<AppPage
		:button-text="$t('text.add')"
		:handler="() => redirect('/dashboard/delivery-cities/item')"
		:title="$t('text.header')"
		:can-edit="canEdit"
		v-if="canView">
		<div class="list-wrapper">
			<div class="list list--list list-more">
				<div class="list__topping">
					<span class="list__heading">{{ $t('text.city') }}</span>
					<span :key="idx" class="list__heading px-65" v-for="(company, idx) in transportCompanies">{{ company.name }}</span>
					<span class="list__heading">{{ $t('text.remove') }}</span>
				</div>
				<div :key="idx" class="list__item" v-for="(city, idx) in deliveryCities">
					<span class="list__elem">
						<button
							:disabled="!canEdit"
							class="list__edit"
							:title="$t('text.edit')"
							@click="() => redirect(`/dashboard/delivery-cities/item?edit=${city.id}`)"></button>
						<span>{{ city.name }}</span>
					</span>

					<span :key="idx" class="list__elem" v-for="(company, idx) in transportCompanies">
						<button
							:disabled="!canEdit"
							@click="updateCity(city, company, !!city.transport_companies.find(item => item.id === company.id))"
							class="dot"
							:class="{
								'dot--red': city.transport_companies.findIndex(item => item.id === company.id) === -1,
								'dot--green': city.transport_companies.find(item => item.id === company.id),
							}"></button>
					</span>
					<span class="list__elem">
						<button
							class="cross"
							:disabled="!canEdit"
							@click="onConfirmDelete(city?.id, city?.name)"
							:title="$t('text.remove')"></button>
					</span>
				</div>
			</div>
		</div>

		<div class="main__bottom">
			<div class="main__inner">
				<p class="main__text">Всего городов: {{ totalAmount }}</p>
				<div class="pagination" v-if="totalAmount <= pageCount * itemsPerPage">
					<app-pagination
						v-model="page"
						:page-count="pageCount"
						:margin-pages="2"
						:page-range="3"
						@input="currentPageHandler"
						:container-class="'pagination__list'"
						:page-class="'pagination__item'"
						:active-link-class="'active'"
						:page-link-class="'pagination__link'"
						:break-view-class="''"
						:break-view-link-class="''"
						:first-last-button="false"
						:nextLinkClass="'next-class'"
						:hide-prev-next="true" />
				</div>
			</div>
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
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import citiesService from '../../../services/citiesService';
import deliveryCitiesService from '../../../services/deliveryCitiesService';
import AskDialog from '../../_components/AskDialog.vue';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import transportCompaniesService from '../../../services/transportCompaniesService';
import AppPagination from '../../_components/AppPagination.vue';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';
import { ADDING_METHOD_ALL } from '../../../utils/constants';
import useGetTransportCompanyId from '../../../composables/pages/dashboard/transportCompanies/useGetTransportCompanyId';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization = useI18n();
const store = useStore<MainState>();
const deliveryCities = ref();
const cities = ref();
const page = ref(1);
const totalAmount = ref();
const itemsPerPage = ref();

const transportCompanies = ref();
const { canEdit, canView } = usePageInit('transportcompany');
const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(deliveryCitiesService);
watch(
	() => marker.value,
	() => (deliveryCities.value = deliveryCities.value.filter(c => c.id !== itemId.value)),
);
const addCitiesNames = (): void => {
	for (const deliveryCity of deliveryCities.value) {
		for (const city of cities.value) {
			if (deliveryCity.city_id === city.id) {
				deliveryCity.name = city.name;
			}
		}
	}
};

const sendData = ref({});

const updateCity = async (city, company, tumbler) => {
	let newCompanies: any = [];
	if (tumbler) {
		newCompanies = city.transport_companies.filter(tk => tk.id !== company.id).map(item => item.id);
	} else {
		newCompanies = city.transport_companies.map(item => item.id);
		newCompanies.push(company.id);
	}

	sendData.value = {
		country_id: city.country_id,
		city_id: city.city_id,
		adding_method: city.adding_method,
		warehouses: city.warehouses.map(item => item.id),
		transport_companies: newCompanies,
	};

	await sleep(1);
	store.commit('setLoading', true);
	const response: any = await deliveryCitiesService.update(
		localization,
		city.id,
		sendData.value,
		['adding_method', 'city_id', 'country_id', 'transport_companies', 'warehouses'],
		errMsg => toaster.error(toast, errMsg),
	);
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		cities.value = await citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
		await currentPageHandler(page.value);
		addCitiesNames();
	}
	store.commit('setLoading', false);
};

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	])
		.then(values => ([cities.value, transportCompanies.value] = [...values]))
		.then(() => {
			currentPageHandler(page.value);
			store.commit('setLoading', false);
		});
});
const { tcId } = useGetTransportCompanyId();
const currentPageHandler = async currentPage => {
	store.commit('setLoading', true);
	deliveryCities.value = await deliveryCitiesService.getAllWithPagination(
		localization,
		currentPage,
		tcId.value,
		ADDING_METHOD_ALL,
		errMsg => toaster.error(toast, errMsg),
	);
	addCitiesNames();
	const total: any = await deliveryCitiesService.totalCities(localization, tcId.value, ADDING_METHOD_ALL, errMsg =>
		toaster.error(toast, errMsg),
	);
	store.commit('setLoading', false);
	page.value = currentPage;

	totalAmount.value = total.total_amount;
	itemsPerPage.value = total.total_per_page;
};
const pageCount = computed(() => Math.ceil(totalAmount.value / itemsPerPage.value));

watch(
	() => store.state.citySearch,
	() => {
		deliveryCities.value = store.state.citySearch;
		addCitiesNames();
	}
);

watch(
	() => store.state.citySearchTotal,
	() => {
		itemsPerPage.value = 100000;
		totalAmount.value = store.state.citySearchTotal;
		page.value = 1;
	}
);

watch(
	() => store.state.searchQuery,
	async () => {
		if (store.state.searchQuery.length < 2) {
			await currentPageHandler(page.value);
		}
	}
);
	
onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>

<style scoped>
.table-scroll {
	overflow-y: auto;
}
.list--list .list__heading:nth-child(2),
.list--list .list__elem:nth-child(2) {
	min-width: 65px;
}

.list--list .list__elem:first-child, .list--list .list__heading:first-child {
    min-width: 210px;
    max-width: 210px;
}

.list__elem span {
	display: inline;
}
</style>
