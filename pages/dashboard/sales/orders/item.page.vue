<template>
	<AppPage
		:title="isEditMode ? `${$t('text.order')} ${order.id}` : $t('text.header')"
		:canEdit="canEdit"
		v-if="canEdit"
		:handler="thanksForFeedback"
		:button-text="$t('text.thanks_button')">
		<div class="main__content">
			<div class="main__inner">
				<a href="/dashboard/sales/orders" class="main__link main__link--back">{{ $t('text.to_list_of_orders') }}</a>
				<span class="main__help">{{ order.created_at }}</span>
			</div>
			<div class="block-wrapper">
				<div class="left-side">
					<div class="left-side-status">
						<span class="main__help">{{ $t('text.order_status') }}</span>
						<select
							v-model="currentOrderStatus"
							class="main__select select"
							@change="setOrderStatus(order.id, order.order_status)"
							:disabled="
								order.order_status === 'return' ||
								order.order_status === 'cancel' ||
								order.order_status === 'complete' ||
								!canEdit
							">
							<option :value="status.value" :key="idx" v-for="(status, idx) in orderStatuses">{{ status.name }}</option>
						</select>
					</div>
					<div class="left-side-shop">
						<span class="main__help"
							>{{ $t('text.shop') }}:
							{{ order?.shop?.subdomain ? `${order?.shop?.subdomain}.${order.domain}` : order.domain }}
							{{ order.is_mobile_version === 'Y' ? '(мобильная версия)' : '' }}</span
						>
					</div>
					<div class="left-side-manager">
						<span class="main__help"
							>{{ $t('text.order_manager') }}: {{ order?.staff?.first_name }} {{ order?.staff?.last_name }}</span
						>
					</div>
				</div>
				<div class="right-side">
					<div class="right-side-client">
						<span class="main__help main__help--bold">{{ $t('text.client') }}: &nbsp;</span>
						<a href="" @click.prevent="toClient(order?.client?.id)" class="main__link"
							>{{ order?.client?.first_name }} {{ order?.client?.last_name }}</a
						>
					</div>
					<div class="right-side-phone">
						<span class="main__help main__help--bold">{{ $t('text.telephone') }}: &nbsp; </span>
						<span> {{ order?.client?.phone }}</span>
					</div>
					<div class="right-side-email">
						<span class="main__help main__help--bold">Email: &nbsp;</span> <span> {{ order?.client?.email }}</span>
					</div>
					<div
						class="right-side-recipient"
						v-if="order.client_email !== order?.client?.email || order.client_phone !== order?.client?.phone">
						<span class="main__help main__help--bold">{{ $t('text.consumer') }}: &nbsp;</span>
						<span> {{ order.client_name }} {{ order.client_surname }} </span>
					</div>
					<div
						class="right-side-recipient-phone"
						v-if="order.client_email !== order?.client?.email || order.client_phone !== order?.client?.phone">
						<span class="main__help main__help--bold">{{ $t('text.telephone') }}: &nbsp;</span>
						<span>{{ order.client_phone }} </span>
					</div>
				</div>
			</div>
		</div>
		<div class="main__sub main__sub--bd-top">
			<div class="main__content">
				<div class="main__inner">
					<div class="main__group main__group--column">
						<span class="main__help main__help--bold">{{ $t('text.comment_order') }}</span>
						<span class="main__help main__help--grey">{{ order?.order_comment }} {{ order?.address_comment }}</span>
					</div>
				</div>
			</div>
		</div>
		<div class="main__content">
			<div class="main__inner">
				<span class="main__help">
					<span class="main__help main__help--bold">{{ $t('text.payment_method') }}: </span>
					<span class="main__help" v-if="order?.payment_method && order?.payment_method.length > 0">{{ order?.payment_method[0]?.name }}</span>
				</span>
				<div class="main__group">
					<span class="main__help">{{ $t('text.payment_status') }}</span>
					<select disabled class="main__select select" v-model="currentPaymentStatus" @change="setPaymentStatus">
						<option :value="paymentStatus.value" :key="idx" v-for="(paymentStatus, idx) in paymentStatuses" selected>
							{{ paymentStatus.name }}
						</option>
					</select>
				</div>
			</div>
		</div>
		<div class="main__sub main__sub--bd-top">
			<div class="main__content">
				<div class="main__inner main__inner--short">
					<span class="main__help" v-if="order?.transport_company && order?.transport_company.length > 0"
						>{{ $t('text.transport_company') }}: <span>{{ order?.transport_company[0]?.name }}</span></span
					>
					<div class="main__block main__block--full">
						<input
							:disabled="!canEdit"
							type="text"
							class="main__input input"
							v-model="tracknumber"
							:placeholder="$t('text.enter_track_number')" />
						<button :disabled="!canEdit" @click="saveTrackNumber" class="btn">{{ $t('text.save') }}</button>
					</div>
				</div>
				<div class="main__inner">
					<span class="main__help"
						>{{ $t('text.delivery_method') }}:
						<span>{{ deliveryPointTypes.find(type => type.value === order.delivery_point_type)?.name }}</span></span
					>
				</div>
				<!-- Адрес доставки -->
				<div class="main__inner">
					<span class="main__help">{{ $t('text.delivery_address') }}: {{ (order.delivery_address != '') ? (order?.city && order?.city.length > 0 ? order?.city[0]?.name : '') + ' ' + order?.delivery_address : order?.delivery_point?.name + ' / ' + order?.delivery_point?.address }}</span>
				</div>
				<div class="main__inner">
					<span class="main__help">{{ $t('text.shipping_cost') }}: {{ order.delivery_cost }}</span>
				</div>
			</div>
		</div>
		<div class="main__content">
			<div class="main__inner">
				<span class="main__help main__help--bold">{{ $t('text.order_composition') }}</span>
			</div>
		</div>
		<div class="list list--bd-top list--four list--flong">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.title_') }}</span>
				<span class="list__heading">{{ $t('text.quantity') }}</span>
				<span class="list__heading">{{ $t('text.cost') }}</span>
				<span class="list__heading">{{ $t('text.amount') }}</span>
			</div>
			<div class="list__item" :key="item.id" v-for="item in order.items">
				<span class="list__elem">
					<div class="main__product">
						<a :href="removeSubdomain(item?.product && item?.product.length > 0 ? item?.product[0]?.url : '')" target='_blank' :title="$t('text.open_on_site')" class="main__product-name">{{ item?.product && item?.product.length > 0 ? item?.product[0]?.name : '' }}</a>
						<span class="main__product-code">{{ $t('text.article_number') }}: {{ item?.product && item?.product.length > 0 ? item?.product[0]?.vendor_code : '' }}</span>
					</div>
				</span>
				<span class="list__elem">{{ item.quantity }}</span>
				<span class="list__elem">{{ item.price }}</span>
				<span class="list__elem">{{ item.total_cost }}</span>
			</div>
		</div>
		<div class="main__content">
			<div class="main__inner main__inner--end">
				<span class="main__help"
					>{{ $t('text.cost_goods') }}: <span>{{ order.total_products_cost }}</span></span
				>
			</div>
			<div class="main__inner main__inner--end">
				<span class="main__help"
					>{{ $t('text.cost_delivery') }}: <span>{{ order.delivery_cost }}</span></span
				>
			</div>
			<div class="main__inner main__inner--total-amount">
				<span class="main__help"
					>{{ $t('text.total_amount') }}: <span>{{ order.total_order_cost }}</span></span
				>
			</div>
			<div class="main__inner main__inner--actions">
				<a href="/dashboard/sales/orders" class="main__link main__link--back">{{ $t('text.to_list_of_orders') }}</a>
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

<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { MainState } from '../../../../store/mainStore';
import sleep from '../../../../utils/sleep';
import getValidator from '../../../../validation/getValidator';
import fetchApi from '../../../../network/fetchEndpoint';
import toaster from '../../../../utils/toaster';
import usePageInit from '../../../../composables/pages/dashboard/usePageInit';
import redirect from '../../../../utils/redirect';
import ordersService from '../../../../services/ordersService';
import citiesService from '../../../../services/citiesService';
import productsService from '../../../../services/productsService';
import useOrdersData from '../../../../composables/pages/dashboard/orders/useOrdersData';
import clientTypesService from '../../../../services/clientTypesService';
import clientsService from '../../../../services/clientsService';
import EditClientModal from '../../../_components/dashboard/clients/EditClientModal.vue';
import countriesService from '../../../../services/countriesService';
import staffService from '../../../../services/staffService';
import { removeSubdomain } from '../../../../utils/constants';
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
};

const toClient = async id => {
	store.commit('setLoading', true);
	client.value = await clientsService.get(localization, id, errMsg => toaster.error(toast, errMsg));
	client.value.country_code = client.value.country.code;
	const countries: any = await countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	const country = countries.find(country => country.code === client.value.country.code);
	client.value.country = country;
	isVisibleEditModal.value = true;
	store.commit('setLoading', false);
};

const { canEdit, canView, itemId, isEditMode } = usePageInit('order');
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const order = ref<any>({});
const city = ref<any>({});
const products = ref<any>([]);
const currentOrderStatus = ref();
const tracknumber = ref();
const currentPaymentStatus = ref();

const { orderStatuses, deliveryPointTypes, paymentStatuses, deliveryMethodsName } = useOrdersData();
const staffs = ref();

onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/sales/orders');
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		ordersService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)),
		productsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		clientTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		staffService.getStaffs(localization, errMsg => toaster.error(toast, errMsg)),
	])
		.then(values => {
			order.value = values[0];
			products.value = values[1];
			clientTypes.value = values[2];
			staffs.value = values[3];
			currentOrderStatus.value = order.value.order_status;
			currentPaymentStatus.value = order.value.payment_status;
			const currentProducts = products.value.filter(product => order.value.items.find(item => item.id === product.id));
			return citiesService.get(localization, order.value.city_id, errMsg => toaster.error(toast, errMsg));
		})
		.then(fetchedCity => {
			city.value = fetchedCity;
			store.commit('setLoading', false);
		});
});
const thanksForFeedback = async () => {
	const response = await ordersService.thanksFeedback(localization, order.value.id, errMsg => toaster.error(toast, errMsg));
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.feedback'));
	}
};
const setOrderStatus = async (id, status) => {
	store.commit('setLoading', true);
	const response: any = await ordersService.changeOrderStatus(localization, id, { status }, errMsg => toaster.error(toast, errMsg));
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
	}
	store.commit('setLoading', false);
};
const setPaymentStatus = async () => {
	store.commit('setLoading', true);
	const response: any = await ordersService.changePaymentStatus(
		localization,
		order.value.id,
		{ payment_method_id: order.value.id },
		errMsg => toaster.error(toast, errMsg),
	);
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
	}
	store.commit('setLoading', false);
};

const saveTrackNumber = async () => {
	store.commit('setLoading', true);
	const response: any = await ordersService.changeTrackNumber(localization, order.value.id, { tracknumber: tracknumber.value }, errMsg =>
		toaster.error(toast, errMsg),
	);
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
	}
	store.commit('setLoading', false);
};

onMounted(() => {
	document.title += ` - ${localization.t('text.header')}`;
});
</script>

<style scoped>
.block-wrapper {
	display: flex;
	align-items: center;
	width: 100%;
	height: 100%;
}
.left-side {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	width: 65%;
}
.right-side {
	height: 100px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
.left-side-status {
	display: flex;
	align-items: center;
	margin-top: 30px;
	gap: 30px;
}
.left-side-status select {
	width: 200px;
}
.left-side-status,
.left-side-shop,
.left-side-manager {
	margin-bottom: 20px;
}

.main__inner--total-amount {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 20px;
}

.main__inner--actions {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>
