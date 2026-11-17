<template>
	<AppPage
		:button-text="$t('text.add_button')"
		:title="$t('text.header')"
		:handler="() => redirect('/dashboard/brands/item')"
		:canEdit="canEdit"
		v-if="canView">
		<div class="list list--four">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.brand_title') }}</span>
				<span class="list__heading">{{ $t('text.code') }}</span>
				<span class="list__heading">{{ $t('text.hidden') }}</span>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			<div class="list__item" :key="brand.id" v-for="brand in brands">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="list__edit"
						@click="redirect(`/dashboard/brands/item?edit=${brand?.id}`)"
						:title="$t('text.edit')"></button>
					<span>{{ brand.name }}</span>
				</span>
				<span class="list__elem">{{ brand.country_code }}</span>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						@click="makeHidden(brand)"
						class="dot"
						:class="{ 'dot--red': brand?.is_hidden === 'Y', 'dot--green': brand?.is_hidden === 'N' }"
						:title="brand?.is_hidden === 'N' ? $t('text.turn_on') : $t('text.turn_off')"></button>
				</span>
				<span class="list__elem">
					<button
						class="cross"
						:disabled="!canEdit"
						:title="$t('text.remove')"
						@click="onConfirmDelete(brand?.id, brand?.name)"></button>
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
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import redirect from '../../../utils/redirect';
import '../../../extensions/Array';
import AskDialog from '../../_components/AskDialog.vue';
import toaster from '../../../utils/toaster';
import brandsService from '../../../services/brandsService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const brands = ref();
const errorNames = ['price_type_id', 'names.0.value'];

const { canEdit, canView } = usePageInit('catalog.brands');

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(brandsService);
watch(
	() => marker.value,
	() => (brands.value = brands.value.filter(c => c.id !== itemId.value)),
);

const makeHidden = async brand => {
	const sendData = {
		names: [
			{
				lang: localization.locale.value,
				value: brand.name,
			},
		],
		official_website: brand.official_website,
		desc: brand.desc,
		is_hidden: brand.is_hidden === 'Y' ? 'N' : 'Y',
		country_code: brand.country_code,
	};
	store.commit('setLoading', true);
	const response: any = await brandsService.update(localization, brand.id, sendData, [], errMsg => toaster.error(toast, errMsg));
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		brands.value = await brandsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	}
	store.commit('setLoading', false);
};

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	store.commit('setLoading', true);
	brands.value = await brandsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
});

watch(
	() => store.state.brandSearch,
	() => {
		brands.value = store.state.brandSearch;
	}
);

watch(
	() => store.state.searchQuery,
	async () => {
		if (store.state.searchQuery.length < 2) {
			store.commit('setLoading', true);
			brands.value = await brandsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
			store.commit('setLoading', false);
		}
	}
);

	
onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
