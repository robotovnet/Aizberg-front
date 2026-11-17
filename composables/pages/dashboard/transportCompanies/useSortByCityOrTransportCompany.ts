import {
	ref, onMounted, watch, inject,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import toaster from '../../../../utils/toaster';
import { ADDING_METHOD_ALL, ADDING_METHOD_PRESET, ADDING_METHOD_MANUAL } from '../../../../utils/constants';
import { MainState } from '../../../../store/mainStore';
/* eslint-disable */
export default function useSortByCityOrTransportCompany(currentPage, cityId, transportCompanyId, service) {
	const toast = inject('toast') as any;
	const localization: any = useI18n();
	const item = ref();
	const store = useStore<MainState>();
	const totalAmount = ref();
	const itemsPerPage = ref();
	const showAutoAdded = ref(false);
	const curPage = ref();

	const changeCityOrTransportCompany = async (currentPage, cityId, transportCompanyId) => {
		item.value = await sort(1, cityId, transportCompanyId, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL);
	};

	const sort = async (currentPage, cityId, transportCompanyId, addingMethod) => {
		store.commit('setLoading', true);
		item.value = await service.getItems(
			localization,
			currentPage,
			cityId,
			transportCompanyId,
			addingMethod,
			errMsg => toaster.error(toast, errMsg),
		);
		await totalPagesHandler(cityId, transportCompanyId, addingMethod);
		store.commit('setLoading', false);
		return item.value;
	};

	const currentPageHandler = async (currentPage, cityId = 0, transportCompanyId = 0) => {
		curPage.value = currentPage
		item.value = await sort(currentPage, cityId, transportCompanyId, showAutoAdded.value ? ADDING_METHOD_ALL : ADDING_METHOD_MANUAL);
	};

	const totalPagesHandler = async (cityId, transportCompanyId, addingMethod) => {
		const total = await service.total(
			localization,
			cityId,
			transportCompanyId,
			addingMethod,
			errMsg => toaster.error(toast, errMsg),
		);
		totalAmount.value = total.total_amount;
		itemsPerPage.value = total.total_per_page;
	};

	return {
		curPage,
		showAutoAdded,
		item,
		totalPagesHandler,
		currentPageHandler,
		sort,
		changeCityOrTransportCompany,
		totalAmount,
		itemsPerPage,
	};
}
