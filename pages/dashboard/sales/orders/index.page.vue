<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit">
		<form action="" class="main__content main__content--bdb">
			<div class="main__inner">
				<!-- С - ПО -->
				<div class="main__group">
					<span class="main__text main__text--nowrap">{{ $t('text.orders_period') }}</span>
					<input type="date" v-model="startDay" @change="filter" class="main__input input" />
					<span class="main__text main__text--black main__text--nowrap">{{ $t('text.to') }}</span>
					<input type="date" v-model="endDay" @change="filter" class="main__input input" />
				</div>
				<!-- Только непросмотренные  -->
				<div class="main__group">
					<label for="status-100" class="checkbox-group">
						<span>{{ $t('text.only_looked') }}</span>
						<input type="checkbox" id="status-100" v-model="isOnlyUnseen" @change="filter" class="checkbox-group__checkbox" />
					</label>
				</div>
			</div>

			<div class="main__inner main__inner--panel main__inner--more">
				<div class="main__group">
					<div class="main__selects">
						<!-- Статус заказа -->
						<select class="main__select select" v-model="status" @change="filter">
							<option :value="'0'">{{ $t('text.order_status') }}</option>
							<option :value="status.value" v-for="(status, idx) in orderStatuses" :key="idx">{{ status.name }}</option>
						</select>
						<!-- Менеджер -->
						<select class="main__select select" v-model="staffId" @change="filter">
							<option :value="'0'">{{ $t('text.manager') }}</option>
							<option :value="staff.id" v-for="(staff, idx) in staffs" :key="idx">
								{{ staff.full_name }}
							</option>
						</select>
						<!-- Если расширенный поиск -->
						<template v-if="isAdvancedSearch">
							<select class="main__select select" v-model="paymentStatus" @change="filter">
								<option :value="false">{{ $t('text.payment_status') }}</option>
								<option :value="status.value" v-for="(status, idx) in paymentStatuses" :key="idx">{{ status.name }}</option>
							</select>
							<select class="main__select select" v-model="paymentMethodId" @change="filter">
								<option :value="false">{{ $t('text.payment_method') }}</option>
								<option :value="method.id" v-for="(method, idx) in paymentMethods" :key="idx">{{ method.name }}</option>
							</select>
							<select class="main__select select" v-model="transportCompanyId" @change="filter">
								<option :value="false">{{ $t('text.tk') }}</option>
								<option :value="company.id" v-for="(company, idx) in transportCompanies" :key="idx">
									{{ company.name }}
								</option>
							</select>
							<select class="main__select select" v-model="deliveryPointType" @change="filter">
								<option :value="false">{{ $t('text.delivery_method') }}</option>
								<option :value="type.value" v-for="(type, idx) in deliveryPointTypes" :key="idx">{{ type.name }}</option>
							</select>
							<select class="main__select select" v-model="shopId" @change="filter">
								<option :value="false">{{ $t('text.shop') }}</option>

								<option :value="shop.id" v-for="(shop, idx) in shops" :key="idx">
									{{ shop.subdomain ? `${shop.subdomain} (${shop.city?.name})` : shop.city?.name }}
								</option>
							</select>
							<select class="main__select select" v-model="cityId" @change="filter">
								<option :value="false">{{ $t('text.city') }}</option>

								<option :value="city.id" v-for="(city, idx) in cities" :key="idx">{{ city.name }}</option>
							</select>
						</template>
					</div>
					<a href="#" @click="toggleAdvancedSearch" class="main__more link" :class="{ 'main__more--reverse': isAdvancedSearch }">
						{{ isAdvancedSearch ? $t('text.compressed_search') : $t('text.advanced_search') }}
					</a>
				</div>
				<input type="text" :placeholder="$t('text.search')" v-model="searchQuery" class="main__input input width-300px ml-15" />
				<button class="btn" @click.prevent="filter">{{ $t('text.find') }}</button>
			</div>
		</form>
		<!-- Сжатое отображение заказа начало-->
		<div v-if="isCompressedDisplay" class="list list--five list--orders list--background">
			<div class="list__topping">
				<span class="list__heading">
					<span>{{ $t('text.order_number') }}</span>
					<span>{{ $t('text.date') }}</span>
				</span>
				<span class="list__heading">{{ $t('text.status') }}</span>
				<span class="list__heading">{{ $t('text.delivery') }}</span>
				<span class="list__heading">{{ $t('text.client') }}</span>
				<span class="list__heading">{{ $t('text.ref_uk') }}</span>
			</div>
			<div class="list__item" v-for="(order, idx) in orders" :key="idx">
				<span class="list__elem">
					<a
						v-if="canEdit"
						href="#"
						@click="() => window.location.replace(`/dashboard/sales/orders/item?edit=${order.id}`)"
						class="modal-btn"
						>{{ order.id }}</a
					>
					<p v-else>{{ order.id }}</p>
					<span>{{ order.created_at }}</span>
				</span>
				<span class="list__elem">
					<select
						class="main__select select"
						@change="changeOrderStatus(order?.id, order?.order_status)"
						:disabled="
							order?.order_status === 'return' || order?.order_status === 'cancel' || order?.order_status === 'complete'
						"
						v-model="order.order_status">
						<option :value="status.value" v-for="(status, idx) in orderStatuses" :key="idx">{{ status.name }}</option>
					</select>
				</span>
				<span class="list__elem">
					{{ order?.transport_company[0]?.name }}<br />
					{{ deliveryPointTypes.filter(type => order?.delivery_point_type === type.value)[0].name }}
				</span>
				<span class="list__elem"
					><a href="#" @click.prevent="openClientModal(order?.client.id)"
						>{{ order?.client.first_name }} {{ order?.client.last_name }}</a
					></span
				>
				<span class="list__elem"
					><a href="#">{{ order?.referrer }}</a></span
				>
			</div>
		</div>
		<!--Развернутое отображение заказа начало-->
		<div v-else class="list list--four list--orders list--background">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.service_information') }}</span>
				<span class="list__heading">{{ $t('text.client') }}</span>
				<span class="list__heading">{{ $t('text.payment') }}</span>
				<span class="list__heading">{{ $t('text.delivery') }}</span>
			</div>
			<div class="list__item" v-for="(order, idx) in orders" :key="idx">
				<div class="list__elem overflow-hidden">
					<div>
						<a
							v-if="canEdit"
							href="#"
							@click="() => window.location.replace(`/dashboard/sales/orders/item?edit=${order.id}`)"
							>{{ order.id }}</a
						>
						<p v-else>{{ order.id }}</p>

						<span>{{ order.created_at }}</span>
					</div>
					<select
						class="main__select select"
						@change="changeOrderStatus(order.id, order.order_status)"
						:disabled="
							order.order_status === 'return' ||
							order.order_status === 'cancel' ||
							order.order_status === 'complete' ||
							!canEdit
						"
						v-model="order.order_status">
						<option :value="status.value" v-for="(status, idx) in orderStatuses" :key="idx">{{ status.name }}</option>
					</select>
					<span v-show='order.staff'>{{ order.staff ? $t('text.manager') : '' }}: {{ order.staff?.first_name }} {{ order.staff?.last_name }}</span>
					<span v-show='order.referrer != ""' class="list__site refer-link" style='text-overflow: ellipsis;'>
						Ref:
						<a :href="order.referrer" class="refer-link">{{ order.referrer }}</a>
					</span>
				</div>
				<div class="list__elem">
					<a href="#" @click.prevent="openClientModal(order?.client?.id)"
						>{{ order?.client?.first_name }} {{ order?.client?.last_name }}</a
					>
					<span>{{ $t('text.telephone') }}: {{ order?.client?.phone }}</span>

					<span>Email: {{ order?.client?.email }}</span>
				</div>
				<div class="list__elem">
					<span>{{ order?.payment_method[0]?.name }}</span>
					<span>{{ paymentStatuses.filter(ps => ps.value === order.payment_status)[0].name }}</span>
					<span>{{ order?.total_products_cost }}р.</span>
				</div>
				<div class="list__elem">
					<span>{{
						order?.transport_company[0]
							? order?.transport_company[0]?.name + ' (' + deliveryPointTypes.filter(type => order?.delivery_point_type === type.value)[0].name + ')'
							: ''
					}}</span>
					<span>{{ order?.city[0]?.name }}</span>
					<span>{{ order?.delivery_cost }}р.</span>
				</div>
			</div>
		</div>
		<!-- Pagination -->
		<div class="main__bottom">
			<div class="main__inner">
				<label for="view-status" class="checkbox-group">
					<span>{{ $t('text.compressed_display') }}</span>
					<input type="checkbox" v-model="isCompressedDisplay" id="view-status" class="checkbox-group__checkbox" />
				</label>
				<p class="main__text">{{ $t('text.total_orders') }}: {{ totalAmount }}</p>
				<div class="pagination" v-if="totalAmount > itemsOnPage">
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
		<edit-client-modal
			:is-visible="isVisibleEditModal"
			@close="closeEditModal"
			@update="updateStaff"
			:client="client"
			:client-types="clientTypes"
			:staffs="staffs" />
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../../store/mainStore';
import clientsService from '../../../../services/clientsService';
import usePageInit from '../../../../composables/pages/dashboard/usePageInit';
import ordersService from '../../../../services/ordersService';
import toaster from '../../../../utils/toaster';
import paymentMethodsService from '../../../../services/paymentMethodsService';
import useOrdersData from '../../../../composables/pages/dashboard/orders/useOrdersData';
import AppPagination from '../../../_components/AppPagination.vue';
import sleep from '../../../../utils/sleep';
import staffService from '../../../../services/staffService';
import transportCompaniesService from '../../../../services/transportCompaniesService';
import shopsService from '../../../../services/shopsService';
import citiesService from '../../../../services/citiesService';
import clientTypesService from '../../../../services/clientTypesService';
import EditClientModal from '../../../_components/dashboard/clients/EditClientModal.vue';
import countriesService from '../../../../services/countriesService';

const clientTypes = ref();
const isVisibleEditModal = ref(false);
const client = ref();
const closeEditModal = () => {
	isVisibleEditModal.value = false;
};
const updateStaff = async clnt => {
	clnt.country_code = client.value.country.code;
	store.commit('setLoading', true);
	const response: any = await clientsService.update(localization, clnt.id, clnt, [], errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
	if (response.message === 'success') {
		store.commit('setLoading', true);
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		store.commit('setLoading', false);
	}
	await pageInit();
};

const openClientModal = async id => {
	store.commit('setLoading', true);
	client.value = await clientsService.get(localization, id, errMsg => toaster.error(toast, errMsg));
	client.value.country_code = client.value.country.code;
	const countries: any = await countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	const country = countries.find(country => country.code === client.value.country.code);
	client.value.country = country;
	isVisibleEditModal.value = true;
	store.commit('setLoading', false);
};

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const dayJs = inject('dayJS') as any;
const { canEdit, canView } = usePageInit('order');

const isAdvancedSearch = ref(false);
const toggleAdvancedSearch = () => {
	isAdvancedSearch.value = !isAdvancedSearch.value;
};

const isCompressedDisplay = ref(false);
const { orderStatuses, deliveryPointTypes, paymentStatuses, deliveryMethodsName } = useOrdersData();

const startDay = ref('2020-01-01');
const endDay = ref(dayJs(dayJs()).format('YYYY-MM-DD'));

const status = ref('0');
const paymentMethodId = ref(false);
const transportCompanyId = ref(false);
const shopId = ref(false);
const paymentStatus = ref(false);
const deliveryPointType = ref(false);
const cityId = ref(false);
const staffId = ref('0');
const dateFrom = computed(() => dayJs(startDay.value).format('DD/MM/YYYY'));
const dateTo = computed(() => dayJs(endDay.value).format('DD/MM/YYYY'));
const isOnlyUnseen = ref(false);
const searchQuery = ref();

const itemsOnPage = ref(2);
const totalAmount = ref();

const pageCount = ref();

const statusString = computed(() => (status.value !== '0' ? `&filters[order_status]=${status.value}` : ''));
const paymentMethodIdString = computed(() => (!!+paymentMethodId.value ? `&filters[payment_method_id]=${paymentMethodId.value}` : ''));
const transportCompanyIdString = computed(() =>
	!!transportCompanyId.value ? `&filters[transport_company_id]=${transportCompanyId.value}` : '',
);
const shopIdString = computed(() => (!!shopId.value ? `&filters[shop_id]=${shopId.value}` : ''));
const paymentStatusString = computed(() => (!!paymentStatus.value ? `&filters[payment_status]=${paymentStatus.value}` : ''));
const deliveryPointTypeString = computed(() =>
	!!deliveryPointType.value ? `&filters[delivery_point_type]=${deliveryPointType.value}` : '',
);
const cityIdString = computed(() => (!!cityId.value ? `&filters[city_id]=${cityId.value}` : ''));
const staffIdString = computed(() => (staffId.value !== '0' ? `&filters[staff_id]=${staffId.value}` : ''));
const dateFromString = computed(() => (!!dateFrom.value ? `&filters[dateFrom]=${dateFrom.value}` : ''));
const dateToString = computed(() => (!!dateTo.value ? `&filters[dateTo]=${dateTo.value}` : ''));
const isOnlyUnseenString = computed(() => (!!isOnlyUnseen.value ? `&filters[unviewed]=Y` : ''));
const searchQueryString = computed(() => (!!searchQuery.value ? `&search=${searchQuery.value}` : ''));

const queryString = computed(
	() =>
		statusString.value +
		paymentMethodIdString.value +
		transportCompanyIdString.value +
		shopIdString.value +
		paymentStatusString.value +
		deliveryPointTypeString.value +
		cityIdString.value +
		staffIdString.value +
		dateFromString.value +
		dateToString.value +
		isOnlyUnseenString.value +
		searchQueryString.value,
);
const page = ref(1);
const currentPageHandler = async (currentPage = page.value) => {
	await sleep(1);
	store.commit('setLoading', true);
	orders.value = await ordersService.getAllWithFilters(localization, currentPage, queryString.value, errMsg =>
		toaster.error(toast, errMsg),
	);
	const total: any = await ordersService.total(localization, queryString.value, errMsg => toaster.error(toast, errMsg));
	pageCount.value = total.total_page;
	totalAmount.value = total.total;
	store.commit('setLoading', false);
};
const filter = async () => {
	store.commit('setLoading', true);
	await currentPageHandler();
	store.commit('setLoading', false);
};
const orders = ref();
const paymentMethods = ref();
const staffs = ref();
const transportCompanies = ref();
const shops = ref();
const cities = ref();
const managerGroupId = import.meta.env.VITE_MANAGER_GROUP_ID;
	
const pageInit = async () => {
	// Получаем параметр search из URL
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get('search');
	if (searchParam) {
		searchQuery.value = searchParam;
	}

	Promise.all([
		ordersService.getAllWithFilters(localization, page.value, queryString.value, errMsg => toaster.error(toast, errMsg)),
		paymentMethodsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		staffService.getStaffsByGroup(localization, managerGroupId, errMsg => toaster.error(toast, errMsg)),
		transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		shopsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		clientTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	])
		.then(values => {
			orders.value = values[0];
			paymentMethods.value = values[1];
			staffs.value = values[2];
			transportCompanies.value = values[3];
			shops.value = values[4];
			cities.value = values[5];
			clientTypes.value = values[6];
		})
		.then(() => {
			currentPageHandler();
		})
		.then(() => store.commit('setLoading', false));
};

onBeforeMount(async () => {
	await sleep(1);
	store.commit('setLoading', true);
	await pageInit();
	// Promise.all([
	// 	ordersService.getAllWithFilters(localization, page.value, queryString.value, errMsg => toaster.error(toast, errMsg)),
	// 	paymentMethodsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	// 	staffService.getStaffs(localization, errMsg => toaster.error(toast, errMsg)),
	// 	transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	// 	shopsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	// 	citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	// 	clientTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	// ])
	// 	.then(values => {
	// 		orders.value = values[0];
	// 		paymentMethods.value = values[1];
	// 		staffs.value = values[2];
	// 		transportCompanies.value = values[3];
	// 		shops.value = values[4];
	// 		cities.value = values[5];
	// 		clientTypes.value = values[6];
	// 	})
	// 	.then(() => {
	// 		currentPageHandler();
	// 	})
	// 	.then(() => store.commit('setLoading', false));
});

const changeOrderStatus = async (id, status) => {
	store.commit('setLoading', true);
	const response: any = await ordersService.changeOrderStatus(localization, id, { status }, errMsg => toaster.error(toast, errMsg));
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
	}
	store.commit('setLoading', false);
};

onMounted(() => {
	document.title += ` - ${localization.t('text.header')}`;
});
</script>
<style lang="scss">
.refer-link {
	width: 80%;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.list--four.list--orders .list__heading:first-child, .list--four.list--orders .list__elem:first-child {
    max-width: 30%;
}

.list--four.list--orders .list__heading:nth-child(2), .list--four.list--orders .list__elem:nth-child(2) {
    margin-left: 0;
    max-width: 20%;
}

.list--four.list--orders .list__heading:nth-child(3), .list--four.list--orders .list__elem:nth-child(3) {
    margin-left: 0;
    max-width: 30%;
    text-align: left;
}

.list--four.list--orders .list__heading:nth-child(4), .list--four.list--orders .list__elem:nth-child(4) {
    margin-left: 0;
    max-width: 17%;
    text-align: left;
}
</style>
