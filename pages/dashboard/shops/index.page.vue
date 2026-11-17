<template>
	<AppPage
		:title="$t('text.header')"
		:button-text="$t('text.add_shop_button')"
		:handler="() => redirect('/dashboard/shops/item')"
		v-if="canView"
		:canEdit="canEdit">
		<div class="list list--four">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.table_shops_header') }}</span>
				<span class="list__heading">{{ $t('text.table_shops_sub_domain') }}</span>
				<span class="list__heading">{{ $t('text.table_shops_toggle') }}</span>
				<span class="list__heading">{{ $t('text.table_shops_remove') }}</span>
			</div>
			<div class="list__item" :key="shop.id" v-for="shop in shops">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="list__edit"
						:title="$t('text.table_shops_edit')"
						@click="redirect(`/dashboard/shops/item?edit=${shop?.id}`)"></button>
					<span>{{ shop.city }}</span>
				</span>
				<span class="list__elem">{{ shop.subdomain ? shop.subdomain : 'Без поддомена' }}</span>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						@click="onOff(shop)"
						class="dot"
						:class="{
							'dot--red': shop?.isActive === 'N',
							'dot--green': shop?.isActive === 'Y',
						}"
						:title="shop?.isActive === 'N' ? $t('text.table_shops_turn_on') : $t('text.table_shops_turn_off')"></button>
				</span>
				<span class="list__elem">
					<button
						class="cross"
						:disabled="!canEdit"
						@click="onConfirmDelete(shop?.id, shop?.city)"
						:title="$t('text.table_shops_remove')"></button>
				</span>
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
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import redirect from '../../../utils/redirect';
import AskDialog from '../../_components/AskDialog.vue';
import toaster from '../../../utils/toaster';
import shopsService from '../../../services/shopsService';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';
import countriesService from '../../../services/countriesService';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const shops = ref<any>('ru');
const countries = ref();
const cities = ref();

const { canEdit, canView } = usePageInit('shop');
const mapShops = fetchedShops =>
	fetchedShops.map(shop => ({
		id: shop.id,
		country_code: shop.city?.country_code,
		city: shop.city?.name,
		city_id: shop.city?.id,
		subdomain: shop.subdomain,
		isActive: shop.is_active,
		phone: shop.phone,
		city_name_dative_case: shop.city_name_dative_case,
	}));
const fetchedShops = ref<any>();
const fetchShops = async () => {
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		shopsService.getAll(localization, (errMsg, _, type) => toaster.error(toast, { [type as any]: [errMsg] })),
		countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	])
		.then(values => {
			[fetchedShops.value, countries.value] = [values[0], values[1]];
			shops.value = mapShops(fetchedShops.value);
		})
		.then(() => store.commit('setLoading', false));
};

const errorNames = ['subdomain', 'city_name_dative_case', 'phone', 'country_id'];

const onOff = async shop => {
	store.commit('setLoading', true);
	if (shop) {
		await shopsService.update(
			localization,
			shop.id,
			{
				country_id: countries.value.find(country => country.code === shop.country_code).id,
				subdomain: shop.subdomain,
				city_id: shop.city_id,
				city_name_dative_case: shop.city_name_dative_case,
				phone: shop.phone.replace(/[^0-9]/g, ''),
				is_active: shop.isActive === 'Y' ? 'N' : 'Y',
			},
			errorNames,
			errMsg => {
				toaster.error(toast, errMsg);
				store.commit('setLoading', false);
			},
		);
		await fetchShops();
	}
	store.commit('setLoading', false);
};

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(shopsService);

watch(
	() => marker.value,
	async () => await fetchShops(),
);

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	store.commit('setLoading', true);
	await fetchShops();
});

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
