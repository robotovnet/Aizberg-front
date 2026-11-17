<template>
	<AppPage
		:button-text="$t('text.add_pickup_point_button')"
		:handler="() => redirect('/dashboard/pickup-points/item')"
		:title="$t('text.header')"
		:canEdit="canEdit"
		v-if="canView">
		<div class="main__content main__content--full">
			<select class="sel-25 select" @change="changeCityOrTransportCompanyHandler" v-model="cityId">
				<option value="0">{{ $t('text.pickup_point_city') }}</option>
				<option v-for="(city, idx) in deliveryCities" :value="city.id" :key="idx">
					{{ city.name }}
				</option>
			</select>
			<select class="sel-25 select" @change="changeCityOrTransportCompanyHandler" v-model="transportCompanyId">
				<option value="0">{{ $t('text.transport_company') }}</option>
				<option v-for="(transportCompany, idx) in transportCompanies" :value="transportCompany.id" :key="idx">
					{{ transportCompany.name }}
				</option>
			</select>
			<label for="type-checkbox" class="checkbox-group">
				<span>{{ $t('text.pickup_point_checkbox_auto') }}</span>
				<input type="checkbox" id="type-checkbox" class="checkbox-group__checkbox" v-model="showAutoAdded" />
			</label>
		</div>
		<div class="list-wrapper">
			<div class="list list--list list--background" v-if="pickupPoints">
				<div class="list__topping">
					<span class="list__heading">{{ $t('text.pickup_point_table_pickup_point') }}</span>
					<span class="list__heading">{{ $t('text.pickup_point_table_pickup_city') }}</span>
					<span class="list__heading" v-for="(company, idx) in transportCompanies" :key="idx">{{ company.name }}</span>
					<span class="list__heading">{{ $t('text.remove') }}</span>
				</div>
				<div class="list__item" v-for="(point, idx) in pickupPoints" :key="idx">
					<span class="list__elem">
						<a v-if="canEdit" class="link" @click="redirect(`/dashboard/pickup-points/item?edit=${point.id}`)">
							{{ point.name }}</a
						>
						<p v-else>{{ point.name }}</p>
					</span>
					<span class="list__elem">
						<template v-for="c in cities">
							<template v-if="c.id === point.city_id"> {{ c.name }}</template>
						</template>
					</span>

					<span class="list__elem" v-for="(company, idx) in transportCompanies" :key="idx">
						<button
							:disabled="!canEdit"
							@click="onOffPickUpPoint(point, company.id)"
							class="dot"
							:class="{
								'dot--red': point.transport_companies.findIndex(item => item.id === company.id) === -1,
								'dot--green': point.transport_companies.find(item => item.id === company.id),
							}"></button>
					</span>
					<span class="list__elem">
						<button
							class="cross"
							:disabled="!canEdit"
							@click="onConfirmDelete(point?.id, point?.name)"
							:title="$t('text.remove')"></button>
					</span>
				</div>
			</div>
		</div>
		<div class="main__bottom">
			<div class="main__inner">
				<p class="main__text">{{ $t('text.total') }} {{ totalAmount }}</p>
				<div class="pagination" v-if="totalAmount > itemsPerPage">
					<app-pagination
						v-if="page"
						v-model="page"
						:page-count="pageCount"
						:margin-pages="2"
						:page-range="3"
						@input="changePageHandler"
						:container-class="'pagination__list'"
						:page-class="'pagination__item'"
						:active-link-class="'active'"
						:page-link-class="'pagination__link'"
						:break-view-class="''"
						:break-view-link-class="''"
						:first-last-button="false"
						:nextLinkClass="'next-class'"
						:hide-prev-next="true"></app-pagination>
				</div>
			</div>
		</div>
		<AskDialog
			:deleteId="itemId?.toString()"
			:title="$t('text.dialog_delete_title')"
			:question="$t('text.dialog_delete_question') + '&quot;' + itemName + '&quot;' + '?'"
			:onConfirm="onDelete">
		</AskDialog>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { log } from 'console';
import redirect from '../../../utils/redirect';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import transportCompaniesService from '../../../services/transportCompaniesService';
import pickUpPointService from '../../../services/pickUpPointService';
import AppPagination from '../../_components/AppPagination.vue';
import AskDialog from '../../_components/AskDialog.vue';
import citiesService from '../../../services/citiesService';
import useSortByCityOrTransportCompany from '../../../composables/pages/dashboard/transportCompanies/useSortByCityOrTransportCompany';
import { ADDING_METHOD_ALL, ADDING_METHOD_MANUAL } from '../../../utils/constants';
import useDeleteHandler from '../../../composables/pages/dashboard/transportCompanies/useDeleteHandler';
import useGetTransportCompanyId from '../../../composables/pages/dashboard/transportCompanies/useGetTransportCompanyId';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';

const { canEdit, canView } = usePageInit('transportcompany');
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const transportCompanies = ref();
const page = ref(1);
const cityId = ref(0);
const transportCompanyId = ref('0');
const cities = ref();
const deliveryCities = ref();

// SORTING
const {
	totalPagesHandler,
	currentPageHandler,
	sort,
	changeCityOrTransportCompany,
	totalAmount,
	itemsPerPage,
	item,
	showAutoAdded,
	curPage,
} = useSortByCityOrTransportCompany(page.value, cityId.value, transportCompanyId.value, pickUpPointService);
const pickupPoints = item;
const pageCount = computed(() => Math.ceil(totalAmount.value / itemsPerPage.value));

const changeCityOrTransportCompanyHandler = () => {
	changeCityOrTransportCompany(page.value, cityId.value, transportCompanyId.value);
};

const changePageHandler = (newPage) => {
	currentPageHandler(newPage, cityId.value, transportCompanyId.value);
};
	
// REMOVE PICK-UP POINT
const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(store, pickUpPointService);
watch(
	() => marker.value,
	async () => await sort(page.value, cityId.value, transportCompanyId.value, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL),
);

watch(() => showAutoAdded.value, async () => await sort(page.value, cityId.value, transportCompanyId.value, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL));
watch(() => cityId, async () => await sort(page.value, cityId.value, transportCompanyId.value, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL));
watch(() => transportCompanyId, async () => await sort(page.value, cityId.value, transportCompanyId.value, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL));

const { tcId } = useGetTransportCompanyId();

// APPLICATION INIT
onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	transportCompanyId.value = tcId.value || 0;
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		pickUpPointService.getCities(localization, errMsg => toaster.error(toast, errMsg)),
		pickUpPointService.getAll(localization, page.value, cityId.value, transportCompanyId.value, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL, errMsg =>
			toaster.error(toast, errMsg),
		),
	])
		.then(values => {
			[transportCompanies.value, cities.value, deliveryCities.value, pickupPoints.value] = [...values];
		})
		.then(() => {
			totalPagesHandler(cityId.value, transportCompanyId.value, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL);
			store.commit('setLoading', false);
		});
});

const onOffPickUpPoint = async (pickUpPoint, tkId) => {
	let tksArr = pickUpPoint.transport_companies.map(tk => +tk.id);
	if (tksArr.find(tk => tk === tkId)) {
		tksArr = tksArr.filter(tk => tk !== tkId);
	} else {
		tksArr.push(tkId);
	}
	const sendData = {
		name: pickUpPoint.name,
		country_id: pickUpPoint.country_id,
		city_id: pickUpPoint.city_id,
		adding_method: pickUpPoint.adding_method,
		address: pickUpPoint.address,
		address_comment: pickUpPoint.address_comment,
		payment_by_card: pickUpPoint.payment_by_card,
		payment_by_cash: pickUpPoint.payment_by_cash,
		postal_code: pickUpPoint.postal_code,
		lat: pickUpPoint.lat,
		lng: pickUpPoint.lng,
		phone: pickUpPoint.phone,
		metro_station: pickUpPoint.metro_station,
		work_time: pickUpPoint.work_time,
		break_work_time: pickUpPoint.break_work_time,
		warehouses: pickUpPoint.warehouses.map(w => w.id),
		transport_companies: tksArr,
	};
	store.commit('setLoading', true);
	await pickUpPointService.update(localization, pickUpPoint.id, sendData, errMsg => toaster.error(toast, errMsg));

	
	
	// pickupPoints.value = item.value;
	pickupPoints.value = await pickUpPointService.getAll(
		localization,
		page.value,
		cityId.value,
		transportCompanyId.value,
		showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL,
		errMsg => toaster.error(toast, errMsg),
	);

	let totalItems = await pickUpPointService.total(
		localization,
		cityId.value,
		transportCompanyId.value,
		showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL,
		errMsg => toaster.error(toast, errMsg),
	);

	totalAmount.value = totalItems.total_amount;
	itemsPerPage.value = totalItems.total_per_page;

	//await currentPageHandler(curPage.value);
	store.commit('setLoading', false);
};

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>

<style>
.list--list .list__elem:first-child, .list--list .list__heading:first-child {
    min-width: 300px;
    max-width: 300px;
}

.list--list .list__elem:nth-child(2), .list--list .list__heading:nth-child(2) {
    margin-left: 20px;
    min-width: 160px;
    max-width: 160px;
}
</style>
