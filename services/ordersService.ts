import fetchApi from '../network/fetchEndpoint';
import type { OrdersService } from '../types/service';

const ordersService: OrdersService = {

	async getAll(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('orders/all?page=1&filters[dateFrom]=01/01/2020&filters[dateTo]=05/04/2022'),
		);
	},

	async getAllWithFilters(localization, page, queryString, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`orders/all?page=${page}${queryString}`),
		);
	},

	async get(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`orders/details/${id}`),
		);
	},
	async changeTrackNumber(localization, id, data, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post(`orders/change-tracknumber/${id}`, data),
		);
	},
	async changeOrderMethod(localization, id, data, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post(`orders/change-method-pay/${id}`, data),
		);
	},
	async changeOrderStatus(localization, id, data, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post(`orders/change-status/${id}`, data));
	},
	async changePaymentStatus(localization, id, data, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post(`orders/change-method-pay/${id}`, data));
	},

	async thanksFeedback(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`orders/thanks-feedback/${id}`),
		);
	},

	async total(localization, filterString, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`orders/all?${filterString}&onlyCount=y`),
		);
	},
};

export default ordersService;
