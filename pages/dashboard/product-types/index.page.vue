<template>
	<AppPage
		:title="$t('text.header')"
		:button-text="$t('text.add_button')"
		:canEdit="canEdit"
		:handler="() => redirect('/dashboard/product-types/item')">
		<div class="list list--three">
			<div class="list__topping">
				<button @click="onSort" class="list__heading list__heading--sort" :title="$t('text.sort')">
					{{ $t('text.table_type') }}
				</button>
				<span class="list__heading">{{ $t('text.table_quantity') }}</span>
				<span class="list__heading">{{ $t('text.table_remove') }}</span>
			</div>
			<div :key="idx" class="list__item" v-for="(group, idx) in catalogGroups">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="list__edit"
						:title="$t('text.edit')"
						@click="() => redirect(`/dashboard/product-types/item?edit=${group?.id}`)"></button>
					<span>{{ group.plural_name }}</span>
				</span>
				<span class="list__elem">{{ group.features_count }}</span>
				<span class="list__elem">
					<button
						class="cross"
						:disabled="!canEdit"
						:title="$t('text.remove')"
						@click="onConfirmDelete(group?.id, group?.plural_name)"></button>
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
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import viewPermissions from '../../../utils/viewPermissions';
import toaster from '../../../utils/toaster';
import productTypesService from '../../../services/productTypesService';
import AskDialog from '../../_components/AskDialog.vue';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import sort from '../../../utils/onSort';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const catalogGroups = ref();
const companies = ref();
const { canEdit, canView } = usePageInit('catalog.groups');
const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(productTypesService);
watch(
	() => marker.value,
	async () => (catalogGroups.value = await productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg))),
);

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	catalogGroups.value = await productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
});

watch(
	() => store.state.productTypeSearch,
	() => {
		catalogGroups.value = store.state.productTypeSearch;
	}
);

watch(
	() => store.state.searchQuery,
	async () => {
		if (store.state.searchQuery.length < 2) {
			store.commit('setLoading', true);
			catalogGroups.value = await productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
			store.commit('setLoading', false);
		}
	}
);

	
onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});

const onSort = () => sort(true, catalogGroups?.value, 'current_product_types_sort', 'plural_name');
</script>

<style>
.list--three .list__elem:first-child, .list--three .list__heading:first-child {
    max-width: 100%;
}
</style>
