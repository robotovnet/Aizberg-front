<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit" :handler="() => redirect('/dashboard/catalog-filters/create')">
		<div class="list list--four list--mla-2">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.product_types') }}</span>
				<span class="list__heading">{{ $t('text.filters_amount') }}</span>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			<div class="list__item" v-for="productType in productTypes" :key="productType.id">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="list__edit"
						:title="$t('text.edit')"
						@click="redirect(`/dashboard/catalog-filters/edit/${productType.id}`)"></button>
					<span>{{ productType.plural_name }}</span>
				</span>
				<span class="list__elem">{{ productType.filters }}</span>

				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="cross"
						@click="onConfirmDelete(productType?.id, productType?.plural_name)"
						:title="$t('text.remove')"></button>
				</span>
			</div>
		</div>
		<AskDialog
			:deleteId="itemId?.toString()"
			:title="$t('text.dialog_delete_title')"
			:question="`${$t('text.dialog_delete_question')} ${itemName} ?`"
			:onConfirm="onDelete" />
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';

import toaster from '../../../utils/toaster';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import AskDialog from '../../_components/AskDialog.vue';
import catalogFiltersService from '../../../services/catalogFiltersService';
import productTypesService from '../../../services/productTypesService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();

const { canEdit, canView } = usePageInit('catalog.filters');

const filters = ref();
const filtersSearch = ref("");
const productTypes = ref();
const filtersCount = ref();
const pageInit = async () => {
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		catalogFiltersService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		catalogFiltersService.getFiltersCount(localization, errMsg => toaster.error(toast, errMsg)),
	])
		.then(values => ([filters.value, productTypes.value, filtersCount.value] = [...values]))
		.then(() => {
			if (filtersSearch.value != '') {
				productTypes.value = productTypes.value.filter(function (elem) {
					return elem.plural_name.toLowerCase().includes(filtersSearch.value.toLowerCase())
		                });
			}
			
			for (const productType of productTypes.value) {
				productType.filters = 0;
				for (const filter of filtersCount.value) {
					if (filter.product_group_id === productType.id) {
						productType.filters = filter.total ? filter.total : 0;
					}
				}
			}
		})
		.then(() => store.commit('setLoading', false));
};
onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await pageInit();
});

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(catalogFiltersService);
watch(
	() => marker.value,
	async () => {
		await sleep(1);
		store.commit('setLoading', true);
		await pageInit();
		store.commit('setLoading', false);
	},
);

watch(
	() => store.state.searchQuery,
	async () => {
		if (store.state.searchQuery.length < 2) {
			filtersSearch.value = "";
		} else {
			filtersSearch.value = store.state.searchQuery;
		}

		await pageInit();
	}
);

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
