<template>
	<AppPage
		:button-text="$t('text.add_currency_button')"
		:title="$t('text.header')"
		:handler="() => redirect('/dashboard/currencies/item')"
		:canEdit="canEdit"
		v-if="canView">
		<div class="list list--five">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.table_currencies_header') }}</span>
				<span class="list__heading">{{ $t('text.table_currencies_code') }}</span>
				<span class="list__heading">{{ $t('text.table_currencies_country') }}</span>
				<span class="list__heading">{{ $t('text.table_currencies_by_default') }}</span>
				<span class="list__heading">{{ $t('text.table_currencies_remove') }}</span>
			</div>
			<div :key="currency.id" class="list__item" v-for="currency in currencies">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="list__edit"
						@click="redirect(`/dashboard/currencies/item?edit=${currency?.id}`)"
						:title="$t('text.table_currencies_edit')"></button>
					<span>{{ currency.name }}</span>
				</span>
				<span class="list__elem">{{ currency.code }}</span>
				<span class="list__elem">
					<template v-for="country in countries">
						<template v-if="country.code === currency.country_code">
							{{ country.name }}
						</template>
					</template>
				</span>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						@click="byDefault(currency)"
						class="dot"
						:class="{ 'dot--red': currency?.is_default === 'N', 'dot--green': currency?.is_default === 'Y' }"
						:title="
							currency?.is_default === 'N' ? $t('text.table_currencies_turn_on') : $t('text.table_currencies_turn_off')
						"></button>
				</span>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="cross"
						:title="$t('text.table_currencies_remove')"
						@click="onConfirmDelete(currency?.id, currency?.name)"></button>
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
import '../../../extensions/Array';
import AskDialog from '../../_components/AskDialog.vue';
import toaster from '../../../utils/toaster';
import currenciesService from '../../../services/currenciesService';
import countriesService from '../../../services/countriesService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import sleep from '../../../utils/sleep';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const currencies = ref();
const countries = <any>ref();
const country = <any>ref(localization.locale.value);
const { canEdit, canView } = usePageInit('currency');
const errorNames = ['names.0.value', 'extra_charge', 'symbol', 'country_code', 'code'];
const byDefault = async currency => {
	store.commit('setLoading', true);
	if (currency) {
		await currenciesService.update(
			localization,
			currency.id,
			{
				names: [
					{
						lang: localization.locale.value,
						value: currency.name,
					},
				],
				code: currency.code,
				symbol: currency.symbol,
				country_code: currency.country_code,
				is_default: currency.is_default ? 'Y' : 'N',
				extra_charge: currency.extra_charge,
			},
			errorNames,
			errMsg => {
				toaster.error(toast, errMsg);
				store.commit('setLoading', false);
			},
		);
	}
	currencies.value = await currenciesService.getAll(localization, (errMsg, _, type) =>
		toaster.error(toast, { [type as string]: [errMsg] }),
	);
	store.commit('setLoading', false);
};

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(currenciesService);
watch(
	() => marker.value,
	() => (currencies.value = currencies.value.filter((item: any) => item.id !== itemId.value)),
);

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	currencies.value = await currenciesService.getAll(localization, (errMsg, _, type) =>
		toaster.error(toast, { [type as string]: [errMsg] }),
	);
	const countriesData: any = await countriesService.getAll(localization, (errMsg, _, type) =>
		toaster.error(toast, { [type as string]: [errMsg] }),
	);
	countries.value = countriesData.map(item => ({
		id: item.id,
		name: item.name,
		code: item.code,
	}));
	store.commit('setLoading', false);
});

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
