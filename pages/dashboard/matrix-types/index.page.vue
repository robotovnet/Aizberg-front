<template>
	<AppPage
		v-if="canView"
		:button-text="$t('text.add_button')"
		:title="$t('text.header')"
		:handler="() => redirect('/dashboard/matrix-types/item')"
		:canEdit="canEdit"
        >
		<div class="list list--three">
			<div class="list__topping">
				<button class="list__heading list__heading--sort" :title="$t('text.sort')" @click="onSort">
					{{ $t('text.table_type') }}
				</button>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			<div :key="type.id" class="list__item" v-for="type in matrixTypes">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						@click="() => redirect(`/dashboard/matrix-types/item?edit=${type.id}`)"
						class="list__edit"
						:title="$t('text.edit')"></button>
					<span>{{ type.name }}</span>
				</span>
				<span class="list__elem">
					<button
						class="cross"
						:disabled="!canEdit"
						:title="$t('text.remove')"
						@click="onConfirmDelete(type.id, type.name)"></button>
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
import matrixTypesService from '../../../services/matrixTypesService';
import redirect from '../../../utils/redirect';
import '../../../extensions/Array';
import sort from '../../../utils/onSort';
import AskDialog from '../../_components/AskDialog.vue';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import toaster from '../../../utils/toaster';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import sleep from '../../../utils/sleep';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const matrixTypes = ref();
const { canEdit, canView } = usePageInit('matrixtype');

onBeforeMount(async () => {
	await sleep(1);
	store.commit('setLoading', true);
	matrixTypes.value = await matrixTypesService.getAll(localization, (errMsg, _, type) => toaster.error(toast, { [type as any]: [errMsg] }));
	store.commit('setLoading', false);
});

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});

const onSort = () => sort(true, matrixTypes?.value, 'matrix_types_sort', 'name');
const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(matrixTypesService);

watch(
	() => marker.value,
	() => (matrixTypes.value = matrixTypes.value.filter((item: any) => item.id !== itemId.value)),
);
</script>

<style>
.list--three .list__heading:first-child, .list--three .list__elem:first-child {
	max-width: 600px;
}
</style>

