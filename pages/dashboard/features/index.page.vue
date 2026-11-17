<template>
	<AppPage
		:title="$t('text.header')"
		:canEdit="canEdit"
		v-if="features"
		:handler="() => redirect('/dashboard/features/item')"
		:button-text="$t('text.add_button')">
		<div class="list list--four list--mla-2">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.parameter') }}</span>
				<span class="list__heading">{{ $t('text.measure') }}</span>
				<span class="list__heading">{{ $t('text.view') }}</span>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			<div class="list__item" v-for="feature in features" :key="feature.id">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="list__edit"
						@click="() => redirect(`/dashboard/features/item?edit=${feature.id}`)"
						:title="$t('text.edit')"></button>
					<span>{{ feature.name }}</span>
				</span>
				<span class="list__elem" v-html="feature.unit"></span>
				<span class="list__elem"> {{ parameterTypes.filter(pType => pType.value === feature.type)[0].name }}</span>

				<span class="list__elem">
					<button
						class="cross"
						:disabled="!canEdit"
						@click="onConfirmDelete(feature?.id, feature?.name)"
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
import catalogFeaturesService from '../../../services/catalogFeaturesService';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import AskDialog from '../../_components/AskDialog.vue';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const features = ref();
const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(catalogFeaturesService);
watch(
	() => marker.value,
	async () => (features.value = await catalogFeaturesService.getAll(localization, errMsg => toaster.error(toast, errMsg))),
);
const toggleIsForAllGroups = async feature => {
	store.commit('setLoading', true);
	const sendData = {
		names: [
			{
				lang: localization.locale.value,
				value: feature.name,
			},
		],
		units: [
			{
				lang: localization.locale.value,
				value: feature.unit,
			},
		],
		is_for_all_groups: feature.is_for_all_groups === 'Y' ? 'N' : 'Y',
		type: feature.type,
	};
	await catalogFeaturesService.update(localization, feature.id, sendData, [], errMsg => toaster.error(toast, errMsg));
	for await (const f of features.value) {
		if (f.id === feature.id) {
			f.is_for_all_groups = feature.is_for_all_groups === 'Y' ? 'N' : 'Y';
		}
	}
	store.commit('setLoading', false);
};

const parameterTypes = ref([
	{
		name: localization.t('text.input'),
		value: 'only_input',
	},
	{
		name: localization.t('text.radio'),
		value: 'radio',
	},
	{
		name: localization.t('text.checkbox'),
		value: 'checkbox',
	},
]);

const { canEdit, canView } = usePageInit('catalog.features');
onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	store.commit('setLoading', true);
	features.value = await catalogFeaturesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
});

watch(
	() => store.state.catalogFeaturesSearch,
	() => {
		features.value = store.state.catalogFeaturesSearch;
	}
);

watch(
	() => store.state.searchQuery,
	async () => {
		if (store.state.searchQuery.length < 2) {
			store.commit('setLoading', true);
			features.value = await catalogFeaturesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
			store.commit('setLoading', false);
		}
	}
);
	
onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
