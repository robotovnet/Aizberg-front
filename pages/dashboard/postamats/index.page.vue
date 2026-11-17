<template>
	<AppPage
		:title="$t('text.header')"
		:canEdit="canEdit"
		:button-text="$t('text.add_postamats_button')"
		:handler="() => redirect('/dashboard/postamats/item')"
		v-if="canView">
		<div class="main__content main__content--full">
			<select class="sel-25 select" v-model="cityId" @change="changeCityOrTransportCompanyHandler">
				<option value="0" selected>{{ $t('text.postamats_city') }}</option>
				<option v-for="(city, idx) in deliveryCities" :value="city.id" :key="idx">
					{{ city.name }}
				</option>
			</select>
			<select class="sel-25 select" @change="changeCityOrTransportCompanyHandler" v-model="transportCompanyId">
				<option value="0">{{ $t('text.transport_company') }}</option>
				<option v-for="transportCompany in transportCompanies" :value="transportCompany.id" :key="transportCompany.id">
					{{ transportCompany.name }}
				</option>
			</select>
			<label for="type-checkbox" class="checkbox-group">
				<span>{{ $t('text.postamats_checkbox_auto') }}</span>
				<input v-model="showAutoAdded" type="checkbox" id="type-checkbox" class="checkbox-group__checkbox" />
			</label>
		</div>
		<div class="list-wrapper">
			<div class="list list--list list--background">
				<div class="list__topping">
					<span class="list__heading">{{ $t('text.postamats_table_postamat') }}</span>
					<span class="list__heading">{{ $t('text.postamats_table_city') }}</span>
					<span class="list__heading" v-for="(company, idx) in transportCompanies" :key="idx">{{ company.name }}</span>
					<span class="list__heading">{{ $t('text.postamats_table_remove') }}</span>
				</div>
				<div class="list__item" v-for="(postamat, idx) in postamats" :key="idx">
					<span class="list__elem">
						<a v-if="canEdit" class="link" @click="redirect(`/dashboard/postamats/item?edit=${postamat.id}`)">
							{{ postamat.name }}</a
						>
						<p v-else>{{ postamat.name }}</p>
					</span>
					<span class="list__elem">
						<template v-for="c in deliveryCities">
							<template v-if="c.id === postamat.city_id"> {{ c.name }}</template>
						</template>
					</span>
					<span class="list__elem" v-for="(company, idx) in transportCompanies" :key="idx">
						<button
							:disabled="!canEdit"
							@click="onOffTransportCompany(postamat, company.id)"
							class="dot"
							:class="{
								'dot--red': postamat.transport_companies.findIndex(item => item.id === company.id) === -1,
								'dot--green': postamat.transport_companies.find(item => item.id === company.id),
							}"></button>
					</span>
					<span class="list__elem">
						<button
							:disabled="!canEdit"
							class="cross"
							@click="onConfirmDelete(postamat?.id, postamat?.name)"
							:title="$t('text.postamats_table_remove')"></button>
					</span>
				</div>
			</div>
		</div>
		<div class="main__bottom">
			<div class="main__inner">
				<p class="main__text">{{ $t('text.total') }}: {{ totalAmount }}</p>
				<div class="pagination" v-if="totalAmount > itemsPerPage">
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
import redirect from '../../../utils/redirect';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import transportCompaniesService from '../../../services/transportCompaniesService';
import postamatsService from '../../../services/postamatsService';
import AppPagination from '../../_components/AppPagination.vue';
import useSortByCityOrTransportCompany from '../../../composables/pages/dashboard/transportCompanies/useSortByCityOrTransportCompany';
import citiesService from '../../../services/citiesService';
import { ADDING_METHOD_ALL, ADDING_METHOD_MANUAL } from '../../../utils/constants';
import useDeleteHandler from '../../../composables/pages/dashboard/transportCompanies/useDeleteHandler';
import AskDialog from '../../_components/AskDialog.vue';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';
import useGetTransportCompanyId from '../../../composables/pages/dashboard/transportCompanies/useGetTransportCompanyId';

const { tcId } = useGetTransportCompanyId();
const { canEdit, canView } = usePageInit('transportcompany');

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const page = ref(1);
const transportCompanyId = ref(0);
const cities = ref();
const deliveryCities = ref();
const cityId = ref(0);
const autoAdded = ref();
const transportCompanies = ref();

// APPLICATION INIT
onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	transportCompanyId.value = tcId.value || 0;
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		postamatsService.getCities(localization, errMsg => toaster.error(toast, errMsg)),
		postamatsService.getItems(localization, page.value, cityId.value, transportCompanyId.value, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL, errMsg =>
			toaster.error(toast, errMsg),
		),
	])
		.then(values => {
			transportCompanies.value = values[0];
			cities.value = values[1];
			deliveryCities.value = values[2];
			postamats.value = values[3];
		})
		.then(() => {
			totalPagesHandler(cityId.value, transportCompanyId.value, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL);
			store.commit('setLoading', false);
		});
});
const onOffTransportCompany = async (postamat, tkId) => {
	let tksArr = postamat.transport_companies.map(tk => +tk.id);
	if (tksArr.find(tk => tk === tkId)) {
		tksArr = tksArr.filter(tk => tk !== tkId);
	} else {
		tksArr.push(tkId);
	}
	const sendData = {
		name: postamat.name,
		country_id: postamat.country_id,
		city_id: postamat.city_id,
		adding_method: postamat.adding_method,
		address: postamat.address,
		address_comment: postamat.address_comment,
		payment_by_card: postamat.payment_by_card,
		payment_by_cash: postamat.payment_by_cash,
		postal_code: postamat.postal_code,
		lat: postamat.lat,
		lng: postamat.lng,
		phone: postamat.phone,
		max_height: postamat.max_height,
		max_width: postamat.max_width,
		max_depth: postamat.max_depth,
		metro_station: postamat.metro_station,
		work_time: postamat.work_time,
		break_work_time: postamat.break_work_time,
		warehouses: postamat.warehouses.map(w => w.id),
		transport_companies: tksArr,
	};
	store.commit('setLoading', true);
	await postamatsService.update(
		localization,
		postamat.id,
		sendData,
		[
			'adding_method',
			'address',
			'address_comment',
			'city_id',
			'country_id',
			'lat',
			'lng',
			'metro_station',
			'name',
			'payment_by_card',
			'payment_by_cash',
			'phone',
			'postal_code',
			'transport_companies',
			'work_time',
		],
		errMsg => toaster.error(toast, errMsg),
	);

	postamats.value = await postamatsService.getItems(
		localization,
		page.value,
		cityId.value,
		transportCompanyId.value,
		showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL,
		errMsg => toaster.error(toast, errMsg),
	);

	postamats.value.forEach(pickupPoint => {
		pickupPoint.transport_companies.forEach(tk => {
			if (tk.id === tkId) {
			}
		});
	});

	await currentPageHandler(curPage.value);
	store.commit('setLoading', false);
};
// SORT BY CITY AND TRANSPORT COMPANY
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
} = useSortByCityOrTransportCompany(page.value, cityId.value, transportCompanyId.value, postamatsService);

const postamats = item;
const pageCount = computed(() => Math.ceil(totalAmount.value / itemsPerPage.value));

const changeCityOrTransportCompanyHandler = () => {
	changeCityOrTransportCompany(page.value, cityId.value, transportCompanyId.value);
};

// REMOVE
const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(store, postamatsService);
watch(
	() => marker.value,
	async () => await sort(page.value, cityId.value, transportCompanyId.value, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL),
);

watch(() => showAutoAdded.value, async () => await sort(page.value, cityId.value, transportCompanyId.value, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL));
watch(() => cityId, async () => await sort(page.value, cityId.value, transportCompanyId.value, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL));
watch(() => transportCompanyId, async () => await sort(page.value, cityId.value, transportCompanyId.value, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL));

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
