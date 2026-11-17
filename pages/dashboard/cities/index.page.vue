<template>
	<AppPage
		:button-text="$t('text.add_city_button')"
		:handler="() => (window.location.href = '/dashboard/cities/item')"
		:title="$t('text.header')"
		:canEdit="canEdit">

		<form action="" class="main__content main__content--bdb">
			<div class="main__inner">
				<div style='width: 100%; text-align: right;'>{{ $t('text.table_cities_which_country') }}</div>
				<select
					class="main__select main__select--ultra select ml-15"
					:class="{ 'select--error': false }"
					v-model="country"
					@change="filter">
					<option :value="country.code" v-for="country in countries">
						{{ country.name }}
					</option>
				</select>
			</div>
		</form>
		
		<div class="list list--four" v-if="canView">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.table_cities_header') }}</span>
				<span class="list__heading">{{ $t('text.table_cities_country') }}</span>
				<span class="list__heading">{{ $t('text.table_cities_by_default') }}</span>
				<span class="list__heading">{{ $t('text.table_cities_remove') }}</span>
			</div>
			<div :key="idx" class="list__item" v-for="(city, idx) in cities">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="list__edit"
						@click="window.location.href = `/dashboard/cities/item?edit=${city?.id}`"
						:title="$t('text.table_cities_edit')"></button>
					<span>{{ city.name }}</span>
				</span>
				<template v-for="country in countries">
					<span class="list__elem" v-if="country.code === city.country_code">
						{{ country.name }}
					</span>
				</template>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						@click="byDefault(city)"
						class="dot"
						:class="{ 'dot--red': city?.is_default === 'N', 'dot--green': city?.is_default === 'Y' }"
						:title="city?.is_default === 'N' ? $t('text.table_cities_turn_on') : $t('text.table_cities_turn_off')"></button>
				</span>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="cross"
						:title="$t('text.remove')"
						@click="onConfirmDelete(city?.id, city?.name)"></button>
				</span>
			</div>
		</div>
		<div class="main__bottom">
			<div class="main__inner">
				<div class="main__text"></div>
				<div class="pagination">
					<app-pagination
						v-model="page"
						:page-count="pageCount"
						:margin-pages="2"
						:page-range="3"
						@input="currentPageHandler"
						:container-class="'pagination__list'"
						:page-class="'pagination__item'"
						:active-link-class="'active'"
						:page-link-class="'pagination__link'"
						:break-view-class="''"
						:break-view-link-class="''"
						:first-last-button="false"
						:nextLinkClass="'next-class'"
						:hide-prev-next="true" />
				</div>
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
import '../../../extensions/Array';
import AskDialog from '../../_components/AskDialog.vue';
import toaster from '../../../utils/toaster';
import citiesService from '../../../services/citiesService';
import countriesService from '../../../services/countriesService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import sleep from '../../../utils/sleep';
import AppPagination from '../../_components/AppPagination.vue';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const cities = ref();
const countries = ref();
const country = ref('ru');

const page = ref(1);
const totalAmount = ref();
const itemsPerPage = ref();
const currentPageBuffer = ref();
const citySearch = ref();
	
const currentPageHandler = async currentPage => {
	currentPageBuffer.value = currentPage;

	store.commit('setLoading', true);
	cities.value = await citiesService.getAllinCountryWithPagination(localization, currentPage, country.value, errMsg =>
		toaster.error(toast, errMsg),
	);
	store.commit('setLoading', false);
	const total: any = await citiesService.totalCitiesInCountry(localization, country.value, errMsg => toaster.error(toast, errMsg));
	totalAmount.value = total.total_amount;
	itemsPerPage.value = total.total_per_page;
};

const pageCount = computed(() => Math.ceil(totalAmount.value / itemsPerPage.value));
const citySearchString = computed(() => (citySearch.value ? `&search=${citySearch.value}` : ''));
	
const citiesData = <any>ref();
const { canEdit, canView } = usePageInit('city');

const filterByCityName = async () => {
	store.commit('setLoading', true);

	cities.value = await citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg), citySearch.value);
	console.log('total: ' + cities.value.length);
	totalAmount.value = cities.value.length;
	
	store.commit('setLoading', false);
};
	
const filterCities = (cities, countryCode) => cities.filter(city => city.country_code === countryCode);
const filter = async () => {
	store.commit('setLoading', true);
	citiesData.value = await citiesService.getAllinCountryWithPagination(localization, page.value, country.value, errMsg =>
		toaster.error(toast, errMsg),
	);
	const total: any = await citiesService.totalCitiesInCountry(localization, country.value, errMsg => toaster.error(toast, errMsg));
	cities.value = filterCities(citiesData.value, country.value);
	totalAmount.value = total.total_amount;
	store.commit('setLoading', false);
};
onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	let total;
	let countriesData;
	const a = Promise.all([
		citiesService.getAllinCountryWithPagination(localization, page.value, country.value, errMsg => toaster.error(toast, errMsg)),
		citiesService.totalCitiesInCountry(localization, country.value, errMsg => toaster.error(toast, errMsg)),
		countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	])
		.then(values => ([citiesData.value, total, countriesData] = [...values]))
		.then(() => {
			totalAmount.value = total.total_amount;
			itemsPerPage.value = total.total_per_page;

			cities.value = filterCities(citiesData.value, country.value);
			countries.value = countriesData.map(item => ({
				id: item.id,
				name: item.name,
				code: item.code,
			}));
		});
	a.then(() => {
		store.commit('setLoading', false);
	});
});
const errorNames = ['names.0.value'];
const byDefault = async city => {
	store.commit('setLoading', true);
	if (city) {
		await citiesService.update(
			localization,
			city.id,
			{
				names: [
					{
						lang: localization.locale.value,
						value: city.name,
					},
				],
				timezone: city.timezone,
				country_code: city.country_code,
				is_default: city.is_default ? 'Y' : 'N',
			},
			errorNames,
			errMsg => {
				toaster.error(toast, errMsg);
				store.commit('setLoading', false);
			},
		);
	}
	filter();
	await currentPageHandler(currentPageBuffer.value);
	store.commit('setLoading', false);
};

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(citiesService);
watch(
	() => marker.value,
	async () => (cities.value = cities.value.filter(c => c.id !== itemId.value)),
);

watch(
	() => store.state.citySearch,
	() => {
		cities.value = store.state.citySearch;
	}
);

watch(
	() => store.state.citySearchTotal,
	() => {
		itemsPerPage.value = 100000;
		totalAmount.value = store.state.citySearchTotal;
		page.value = 1;
	}
);

watch(
	() => store.state.searchQuery,
	async () => {
		if (store.state.searchQuery.length < 2) {
			await currentPageHandler(currentPageBuffer.value);
		}
	}
);

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>

<style>
.list--four .list__elem:first-child, .list--four .list__heading:first-child {
    max-width: 300px !important;
}
</style>
