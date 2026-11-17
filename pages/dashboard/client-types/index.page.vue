<template>
	<AppPage
		:button-text="$t('text.add_price_type_button')"
		:title="$t('text.header')"
		:handler="() => (window.location.href = '/dashboard/client-types/item')"
		:canEdit="canEdit">
		<div class="list list--four">
			<div class="list__topping">
				<button class="list__heading list__heading--sort" :title="$t('text.table_client_type_action')" @click="onSort">
					{{ $t('text.table_client_type_header') }}
				</button>
				<button class="list__heading list__heading--sort" :title="$t('text.table_client_type_action')" @click="onSortByPriceType">
					{{ $t('text.table_client_type_price_type') }}
				</button>
				<span class="list__heading">{{ $t('text.table_client_type_default') }}</span>
				<span class="list__heading">{{ $t('text.table_client_type_remove') }}</span>
			</div>
			<div class="list__item" v-for="type in clientTypes">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="list__edit"
						:title="$t('text.table_client_type_edit')"
						@click="window.location.href = `/dashboard/client-types/item?edit=${type?.id}`"></button>
					<span>{{ type?.name }}</span>
				</span>
				<span class="list__elem">{{ type.price_type }}</span>

				<span class="list__elem">
					<button
						:disabled="!canEdit"
						@click="byDefault(type)"
						class="dot"
						:class="{ 'dot--red': type?.is_default === 'N', 'dot--green': type?.is_default === 'Y' }"
						:title="
							type?.is_default === 'N' ? $t('text.table_client_type_turn_on') : $t('text.table_client_type_turn_off')
						"></button>
				</span>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="cross"
						:title="$t('text.table_client_type_remove')"
						@click="onConfirmDelete(type?.id, type?.name)"></button>
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
import { inject, ref, watch, nextTick, onBeforeMount } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import clientTypesService from '../../../services/clientTypesService';
import '../../../extensions/Array';
import sort from '../../../utils/onSort';
import AskDialog from '../../_components/AskDialog.vue';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import redirect from '../../../utils/redirect';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import sleep from '../../../utils/sleep';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const clientTypes = ref<any>([]);

const { canEdit, canView } = usePageInit('clienttype');

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(clientTypesService);
watch(
	() => marker.value,
	() => (clientTypes.value = clientTypes.value.filter(c => c.id !== itemId.value)),
);

const fetchClientTypes = async () => {
	const clientTypesFetched = await clientTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg));

	clientTypes.value = clientTypesFetched.map(item => ({
		id: item.id,
		is_default: item.is_default === 'Y' ? 'Y' : 'N',
		name: item.name,
		price_type: item.price_type?.name,
		price_type_id: item.price_type_id,
	}));
};

const byDefault = async clientType => {
	store.commit('setLoading', true);
	if (clientType) {
		await clientTypesService.update(
			localization,
			clientType.id,
			{
				names: [
					{
						lang: localization.locale.value,
						value: clientType.name,
					},
				],
				price_type_id: clientType.price_type_id,
				is_default: clientType.is_default === 'Y' ? 'N' : 'Y',
			},
			errMsg => {
				toaster.error(toast, errMsg);
				store.commit('setLoading', false);
			},
		);
	}
	await fetchClientTypes();
	store.commit('setLoading', false);
};

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	await fetchClientTypes();
	store.commit('setLoading', false);
});

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
const onSort = () => sort(true, clientTypes?.value, 'price_types_sort', 'name');
const onSortByPriceType = () => sort(true, clientTypes?.value, 'price_types_sort_', 'price_type');
</script>
