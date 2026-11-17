import fetchApi from '../network/fetchEndpoint';
import type { OneClickOrder } from '../types/service';

const oneClickOrderService = {

	async getAll(
		localization,
		page,
		queryString,
		onError,
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`order-one-click/all?page=${page}${queryString}`), ['date_from', 'date_to'],
		);
	},
	async total(
		localization,
		queryString,
		onError,
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`order-one-click/all?${queryString}&onlyCount=yes`),
		);
	},

	async getActiveCatalogSections(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('order-one-click/catalog-sections'),
		);
	},

	async setActiveCatalogSections(localization, data, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('order-one-click/catalog-sections', data),
		);
	},

	async setSubscribers(localization, data, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('order-one-click/subscribers', data),
		);
	},

	async getSubscribers(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('order-one-click/subscribers'),
		);
	},

	async completed(localization, data, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('order-one-click/completed', data),
		);
	},

};

export default oneClickOrderService;
