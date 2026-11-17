<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit" v-if="canView">
		<form action="" class="main__content main__content--bdb">
			<div class="main__inner">
				<div class="main__group main__group--checkbox-sm">
					<span class="main__help">{{ $t('text.client_type') }}:</span>
					<label class="checkbox-group">
						<input
							type="radio"
							:value="0"
							id="status-product-checkbox1"
							name="status-product"
							class="checkbox-group__checkbox"
							v-model="filterClientTypeId" />
						<span>{{ $t('text.all') }}</span>
						<template :key="clientType.id" v-for="clientType in clientTypes">
							<input
								type="radio"
								:value="clientType.id"
								id="status-product-checkbox1"
								name="status-product"
								class="checkbox-group__checkbox"
								v-model="filterClientTypeId" />
							<span>{{ clientType.name }}</span>
						</template>
					</label>
				</div>
				<div class="main__group">
					<span class="main__text main__text--nowrap">{{ $t('text.registration_from') }}</span>
					<input type="date" v-model="regFrom" class="main__input input" />
					<span class="main__text main__text--black main__text--nowrap">{{ $t('text.to') }}</span>
					<input type="date" v-model="regTo" class="main__input input" />
				</div>
			</div>
			<div class="main__inner main__inner--panel">
				<div class="main__group">
					<select v-model="filterCityId" @change="filter" class="main__select select width-200px">
						<option value="0" selected>{{ $t('text.city') }}</option>
						<option :value="city.id" :key="city.id" v-for="city in cities">{{ city.name }}</option>
					</select>
					<select v-model="managerId" @change="filter" class="main__select select width-200px ml-20">
						<option value="0" selected>{{ $t('text.manager') }}</option>
						<option :value="manager.id" :key="manager.id" v-for="manager in staffs">
							{{ manager.last_name }} {{ manager.first_name }}
						</option>
					</select>
				</div>
				<input type="text" :placeholder="$t('text.fio')" v-model="fio" class="main__input input width-300px ml-15" />
				<button class="btn" @click.prevent="filter">{{ $t('text.find') }}</button>
			</div>
		</form>
		<div class="list list--six list--center list--background">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.client') }}</span>
				<span class="list__heading">{{ $t('text.contacts') }}</span>
				<span class="list__heading">
					<span>{{ $t('text.manager') }}</span>
					<span>{{ $t('text.client_type') }}</span>
				</span>
				<span 
					class="list__heading list__heading--sort" 
					:class="{
						'list__heading--sort-asc': sortBy === 'ransom_amount' && sortOrder === 'asc',
						'list__heading--sort-desc': sortBy === 'ransom_amount' && sortOrder === 'desc'
					}"
					style="cursor: pointer;"
					@click="onSortByRansomAmount"
				>
					{{ $t('text.ransom_amount') }}
				</span>
				<span 
					class="list__heading list__heading--sort"
					:class="{
						'list__heading--sort-asc': sortBy === 'total_orders' && sortOrder === 'asc',
						'list__heading--sort-desc': sortBy === 'total_orders' && sortOrder === 'desc'
					}"
					style="cursor: pointer;"
					@click="onSortByTotalOrders"
				>
					{{ $t('text.total_orders') }}
				</span>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			<div class="list__item" :key="client.id" v-for="client in clients">
				<span class="list__elem">
					<p v-if="canEdit">
						<a href="#" @click="showEditModal(client)" class="modal-btn">
							{{ client.first_name }} {{ client.last_name }}
						</a>
						<span v-if='client.deleted_at != null' style='display: inline; color: brown;'> (удален)</span>
					</p>

					<p v-else>
						{{ client.first_name }} {{ client.last_name }}
						<span v-if='client.deleted_at != null' style='display: inline; color: brown;'> (удален)</span>
					</p>
				</span>
				<span class="list__elem">
					<a target="blank" :href="`mailto: ${client?.email}`">{{ client.email }}</a>
					<span>+{{ client.phone }}</span>
				</span>
				<span class="list__elem">
					<span>{{ client?.staff[0]?.last_name }}</span>
					<span>{{ client?.client_type[0]?.name }}</span>
				</span>
				<span class="list__elem">{{ formatNumber(client?.ransom_amount) }}</span>
				<span class="list__elem">
					<a 
						href="#" 
						@click.prevent="goToOrders(client.email)"
						target="_blank"
						class="link"
					>{{ formatNumber(client?.total_orders) }}</a>
				</span>
				<span class="list__elem">
					<button
						v-if='client.deleted_at == null'
						:disabled="!canEdit"
						class="cross"
						:title="$t('text.remove')"
						@click="onConfirmDelete(client.id, client.first_name + ' ' + client.last_name)"></button>
				</span>
			</div>
		</div>
		<div class="main__bottom">
			<div class="main__inner">
				<p class="main__text">{{ $t('text.total_clients') }}: {{ totalAmount }}</p>

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
			:client="editedClient"
			:client-types="clientTypes"
			:staffs="staffs" />
		<AskDialog
			:deleteId="itemId?.toString()"
			:title="$t('text.dialog_delete_title')"
			:question="$t('text.dialog_delete_question') + '&quot;' + itemName + '&quot;' + '?'"
			:onConfirm="onDelete" />
	</AppPage>
</template>

<style>
.link {
    color: inherit;
    text-decoration: none;
    cursor: pointer;
}

.link:hover {
    text-decoration: underline;
}
</style>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../../store/mainStore';
import '../../../../extensions/Array';
import AskDialog from '../../../_components/AskDialog.vue';
import toaster from '../../../../utils/toaster';
import usePageInit from '../../../../composables/pages/dashboard/usePageInit';
import useDeleteHandler from '../../../../composables/pages/dashboard/useDeleteHandler';
import clientsService from '../../../../services/clientsService';
import clientTypesService from '../../../../services/clientTypesService';
import citiesService from '../../../../services/citiesService';
import staffService from '../../../../services/staffService';
import EditClientModal from '../../../_components/dashboard/clients/EditClientModal.vue';
import sleep from '../../../../utils/sleep';
import AppPagination from '../../../_components/AppPagination.vue';
import redirect from '../../../../utils/redirect';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const clients = ref();
const itemsOnPage = ref(50);
const totalAmount = ref();
const currentPageHandler = async (currentPage = page.value) => {
	//await sleep(1);
	console.log(currentPage);
	
	store.commit('setLoading', true);
	//totalAmount.value = 0;
	clients.value = await clientsService.getAllWithFilters(localization, currentPage, queryString.value, errMsg =>
		toaster.error(toast, errMsg),
	);
	const total: any = await clientsService.total(localization, queryString.value, errMsg => toaster.error(toast, errMsg));
	totalAmount.value = total.total;
	store.commit('setLoading', false);
};
const errorNames = ['price_type_id', 'names.0.value', 'is_default'];

const { canEdit, canView } = usePageInit('client');

const pageCount = computed(() => Math.ceil(totalAmount.value / itemsOnPage.value));
const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(clientsService);
watch(
	() => marker.value,
	() => (clients.value = clients.value.filter(c => c.id !== itemId.value), totalAmount.value = totalAmount.value - 1 ),
);

const filterClientTypeId = ref(0);
const filterCityId = ref(0);
const managerId = ref(0);
const regFrom = ref();
const regTo = ref();
const fio = ref();
const page = ref(1);

const sortBy = ref('');
const sortOrder = ref('asc');

const onSortByRansomAmount = () => {
	if (sortBy.value === 'ransom_amount') {
		sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
	} else {
		sortBy.value = 'ransom_amount';
		sortOrder.value = 'desc';
	}
	filter();
};

const onSortByTotalOrders = () => {
	if (sortBy.value === 'total_orders') {
		sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
	} else {
		sortBy.value = 'total_orders';
		sortOrder.value = 'desc';
	}
	filter();
};

const clientTypeString = computed(() => (filterClientTypeId.value ? `&client_type_id=${filterClientTypeId.value}` : ''));
const cityString = computed(() => (filterCityId.value ? `&city_id=${filterCityId.value}` : ''));
const managerString = computed(() => (managerId.value ? `&staff_id=${managerId.value}` : ''));
const regFromString = computed(() => (regFrom.value ? `&reg_date_from=${regFrom.value}` : ''));
const regToString = computed(() => (regTo.value ? `&reg_date_to=${regTo.value}` : ''));
const fioString = computed(() => (fio.value ? `&search=${fio.value}` : ''));
const sortString = computed(() => (sortBy.value ? `&sort_by=${sortBy.value}&sort_order=${sortOrder.value}` : ''));

const queryString = computed(
	() => clientTypeString.value + cityString.value + managerString.value + regFromString.value + regToString.value + fioString.value + sortString.value,
);

const isVisibleEditModal = ref(false);
const editedClient = ref();
const showEditModal = client => {
	editedClient.value = client;
	isVisibleEditModal.value = true;
};
const closeEditModal = () => {
	isVisibleEditModal.value = false;
};

const filter = async () => {
	store.commit('setLoading', true);
	await currentPageHandler();
	store.commit('setLoading', false);
};
watch(
	() => filterClientTypeId.value,
	() => filter(),
);
const updateStaff = async client => {
	const response: any = await clientsService.update(localization, client.id, client, [], errMsg => toaster.error(toast, errMsg));
	if (response.message === 'success') {
		store.commit('setLoading', true);
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		clients.value = await clientsService.getAllWithFilters(localization, page.value, queryString.value, errMsg =>
			toaster.error(toast, errMsg),
		);
		store.commit('setLoading', false);
	}
};

const clientTypes = ref();
const clientType = ref();
const cities = ref();
const city = ref();
const staffs = ref();
const managerGroupId = import.meta.env.VITE_MANAGER_GROUP_ID;
	
onBeforeMount(async () => {
	if (!canView) redirect('/dashboard');
	Promise.all([
		clientsService.getCitiesWithClients(localization, errMsg => toaster.error(toast, errMsg)),
		clientTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		staffService.getStaffsByGroup(localization, managerGroupId, errMsg => toaster.error(toast, errMsg)),
		currentPageHandler(page.value),
	])
		.then(values => ([cities.value, clientTypes.value, staffs.value] = [...values]))
		.then(() => {
			const clientId = new URLSearchParams(window.location.search).get('id');
			if (clientId) {
				return clientsService.get(localization, clientId, errMsg => toaster.error(toast, errMsg));
			}
		})
		.then(() => store.commit('setLoading', false));
});

onMounted(async () => {
	document.title += ` - ${localization.t('text.header')}`;
});

const formatNumber = (num) => {
	if (!num) return '0';
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
};

const goToOrders = (email) => {
	const ordersUrl = `/dashboard/sales/orders?search=${encodeURIComponent(email)}`;
	window.open(ordersUrl, '_blank');
};
</script>
