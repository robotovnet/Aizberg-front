<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit" v-if="canView">
		<div class="list list--three list--goods">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.order_number') }}</span>
				<span class="list__heading">{{ $t('text.order_time') }}</span>
				<span class="list__heading">{{ $t('text.processed') }}</span>
			</div>
			<form class="main__content">
				<!-- DATE -->
				<div class="main__group">
					<span class="main__text main__text--grey main__text--nowrap"> {{ $t('text.period') }} {{ $t('text.from') }}</span>
					<input type="date" min="2000-01-01" max="2100-01-01" v-model="startDay" class="main__input input" />
					<span class="main__text main__text--grey main__text--nowrap">{{ $t('text.to') }}</span>
					<input type="date" min="2000-01-01" max="2100-01-01" v-model="endDay" class="main__input input" />
				</div>
				<div class="main__group">
					<label class="checkbox-group">
						<input type="checkbox" v-model="onlyCompleted" class="checkbox-group__checkbox" />
						<span>{{ $t('text.only_unprocessed') }}</span>
					</label>
					<button class="main__btn main__btn--standart" @click.prevent="filter">{{ $t('text.find') }}</button>
				</div>
			</form>
			<div :key="index" class="list__item" v-for="(order, index) in orders">
				<div class="list__elem">
					<div class="main__product">
						<div class="main__group">
							<span class="main__text main__text--grey">{{ order.product_id }}</span>
							<a :href="removeSubdomain(order.product[0]?.url)" target='_blank' :title="$t('text.open_on_site')" class="main__product-name"> {{ order.product[0]?.name }}</a>
						</div>
						<div class="main__group">
							<span class="main__product-code">{{ $t('text.tel') }}: +{{ order.client_phone }}</span>
							<span class="main__product-code"
								>{{ $t('text.email') }}: <a :href="`mailto:${order.client_email}`">{{ order.client_email }}</a></span
							>
						</div>
						<!-- <button :disabled="!canEdit" class="main__product-code btn">{{ $t('text.make_application') }}</button> -->
					</div>
				</div>
				<span class="list__elem">{{ order.created_at }}</span>
				<span class="list__elem">
					<label class="checkbox-group checkbox-group--center">
						<input
							type="checkbox"
							v-model="completedOrders[index]"
							@change="doCompleted(order)"
							class="checkbox-group__checkbox" />
					</label>
				</span>
			</div>
		</div>
		<div class="main__bottom">
			<div class="main__inner">
				<p class="main__text">{{ $t('text.total') }} {{ $t('text.orders') }}: {{ totalAmount }}</p>
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
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { response } from 'express';
import { MainState } from '../../../../store/mainStore';

import toaster from '../../../../utils/toaster';
import usePageInit from '../../../../composables/pages/dashboard/usePageInit';
import oneClickOrderService from '../../../../services/oneClickOrderService';
import productsService from '../../../../services/productsService';
import sleep from '../../../../utils/sleep';
import AppPagination from '../../../_components/AppPagination.vue';
import ordersService from '../../../../services/ordersService';
import redirect from '../../../../utils/redirect';
import { removeSubdomain } from '../../../../utils/constants';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const dayJs = inject('dayJS') as any;
const orders = ref();

const { canEdit, canView, itemId, isEditMode } = usePageInit('orderoneclick');

const itemsOnPage = ref(4);
const totalAmount = ref();
const page = ref(1);
const pageCount = computed(() => Math.ceil(totalAmount.value / itemsOnPage.value));

const onlyCompleted = ref(false);

const products = ref();
onBeforeMount(async () => {
	if (!canView) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	await currentPageHandler();
	store.commit('setLoading', false);
});

const doCompleted = async order => {
	const sendData = {
		is_completed: order.is_completed === 'Y' ? 'N' : 'Y',
		order_id: order.id,
	};
	await sleep(1);
	store.commit('setLoading', true);
	const response = await oneClickOrderService.completed(localization, sendData, errMsg => toaster.error(toast, errMsg));
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
	}
	await currentPageHandler();
	store.commit('setLoading', false);
};

const startDay = ref(dayJs(dayJs().subtract(1, 'year')).format('YYYY-MM-DD'));
const endDay = ref(dayJs(dayJs()).format('YYYY-MM-DD'));
const dateFrom = computed(() => dayJs(startDay.value).format('DD/MM/YYYY'));
const dateTo = computed(() => dayJs(endDay.value).format('DD/MM/YYYY'));

const onlyCompletedstring = computed(() => (onlyCompleted.value ? '&only_completed=N' : ''));
const dateFromstring = computed(() => `&date_from=${dateFrom.value}`);
const dateTostring = computed(() => `&date_to=${dateTo.value}`);

const queryString = computed(() => onlyCompletedstring.value + dateFromstring.value + dateTostring.value);
const errorNames = ref();

const completedOrders = ref([]);
const currentPageHandler = async (currentPage = page.value) => {
	await sleep(1);
	store.commit('setLoading', true);
	orders.value = await oneClickOrderService.getAll(localization, currentPage.toString(), queryString.value, errMsg =>
		toaster.error(toast, errMsg),
	);
	completedOrders.value = orders.value.map(order => order.is_completed === 'Y');
	const total: any = await oneClickOrderService.total(localization, queryString.value, errMsg => toaster.error(toast, errMsg));
	totalAmount.value = 4;
	totalAmount.value = total.total;
	store.commit('setLoading', false);
};
const filter = async () => {
	store.commit('setLoading', true);
	await currentPageHandler();
	store.commit('setLoading', false);
};
onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
