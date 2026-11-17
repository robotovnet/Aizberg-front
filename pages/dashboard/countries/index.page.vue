<template>
	<AppPage
		:button-text="$t('text.add_country_button')"
		:title="$t('text.header')"
		:handler="() => redirect('/dashboard/countries/item')"
		:canEdit="canEdit"
		v-if="canView">
		<div class="list list--four">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.table_countries_header') }}</span>
				<span class="list__heading">{{ $t('text.table_countries_code') }}</span>
				<span class="list__heading">{{ $t('text.table_countries_by_default') }}</span>
				<span class="list__heading">{{ $t('text.table_countries_remove') }}</span>
			</div>
			<div class="list__item" :key="country.id" v-for="country in countries">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="list__edit"
						@click="() => redirect(`/dashboard/countries/item?edit=${country?.id}`)"
						:title="$t('text.table_countries_edit')"></button>
					<span>{{ country.name }}</span>
				</span>

				<span class="list__elem">{{ country.code }}</span>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						@click="byDefault(country)"
						class="dot"
						:class="{ 'dot--red': country?.is_default === 'N', 'dot--green': country?.is_default === 'Y' }"
						:title="
							country?.is_default === 'N' ? $t('text.table_countries_turn_on') : $t('text.table_countries_turn_off')
						"></button>
				</span>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="cross"
						:title="$t('text.table_countries_remove')"
						@click="onConfirmDelete(country?.id, country?.name)"></button>
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
import countriesService from '../../../services/countriesService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const countries = ref();
const errorNames = ['price_type_id', 'names.0.value', 'is_default'];
const { canEdit, canView } = usePageInit('country');
const byDefault = async country => {
	store.commit('setLoading', true);
	if (country) {
		await countriesService.update(
			localization,
			country.id,
			{
				names: [
					{
						lang: localization.locale.value,
						value: country.name,
					},
				],
				code: country.code,
				language: country.language,
				is_default: country.is_default ? 'Y' : 'N',
			},
			errorNames,
			errMsg => {
				toaster.error(toast, errMsg);
				store.commit('setLoading', false);
			},
		);
	}
	countries.value = await countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
};
const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(countriesService);
watch(
	() => marker.value,
	() => (countries.value = countries.value.filter(c => c.id !== itemId.value)),
);

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	store.commit('setLoading', true);
	countries.value = await countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
});

watch(
	() => store.state.countrySearch,
	() => {
		countries.value = store.state.countrySearch;
	}
);

watch(
	() => store.state.searchQuery,
	async () => {
		if (store.state.searchQuery.length < 2) {
			store.commit('setLoading', true);
			countries.value = await countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
			store.commit('setLoading', false);
		}
	}
);
	
onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>

<style>
.list--four .list__elem:first-child, .list--four .list__heading:first-child {
    max-width: 250px;
}
</style>
