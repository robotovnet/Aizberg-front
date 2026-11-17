<template>
	<AppPage
		:button-text="$t('text.add_warehouse_button')"
		:handler="() => redirect('/dashboard/warehouses/item')"
		:title="$t('text.header')"
		:canEdit="canEdit"
		v-if="canView">
		<div class="list list--four list--d-center list--background">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.warehouse') }}</span>
				<span class="list__heading">{{ $t('text.priority') }}</span>
				<span class="list__heading">{{ $t('text.toggle') }}</span>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			<div class="list__item" v-for="warehouse in warehouses">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="list__edit"
						:title="$t('text.edit')"
						@click="() => redirect(`/dashboard/warehouses/item?edit=${warehouse.id}`)"></button>
					<span>{{ warehouse.name }}</span>
				</span>
				<span class="list__elem">{{ warehouse.priority }}</span>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="dot"
						@click="onOff(warehouse.id)"
						:class="{ 'dot--red': warehouse?.is_active === 'N', 'dot--green': warehouse?.is_active === 'Y' }"></button>
				</span>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="cross"
						@click="onConfirmDelete(warehouse?.id, warehouse?.name)"
						:title="$t('text.remove')"></button>
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
import redirect from '../../../utils/redirect';
import toaster from '../../../utils/toaster';
import warehousesService from '../../../services/warehousesService';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import AskDialog from '../../_components/AskDialog.vue';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const pickupPoints = ref();
const warehouses = ref();
const { canEdit, canView } = usePageInit('transportcompany.warehouses');
const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(warehousesService);
watch(
	() => marker.value,
	async () => (warehouses.value = await warehousesService.getAll(localization, errMsg => toaster.error(toast, errMsg))),
);

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	warehouses.value = await warehousesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
});
const onOff = async id => {
	store.commit('setLoading', true);
	const warehouse: any = await warehousesService.get(localization, id, errMsg => toaster.error(toast, errMsg));
	const sendData = {
		names: [
			{
				lang: localization.locale.value,
				value: warehouse.name,
			},
		],
		label_1c: warehouse.label_1c,
		code: warehouse.code,
		priority: warehouse.priority,
		is_active: warehouse.is_active === 'Y' ? 'N' : 'Y',
		transport_companies: warehouse.transport_companies.map(item => item.pivot),
	};
	const response: any = await warehousesService.update(localization, id, sendData, [], errMsg => toaster.error(toast, errMsg));
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		warehouses.value = await warehousesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	}
	store.commit('setLoading', false);
};
onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
