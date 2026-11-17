import fetchApi from '../network/fetchEndpoint';
import type { PaymentService } from '../types/service';

const paymentMethodsService: PaymentService = {
	
	async getAll(localization, onError) {
		return await fetchApi(
				localization,
				onError,
				axios => axios.get('transport-companies/payment-methods/all'),
		);
	},
	
	async get(localization, id, onError) {
		return await fetchApi(
				localization,
				onError,
				axios => axios.get(`transport-companies/payment-methods/${id}`),
		);
	},
	
	async create(localization, data, errorNames, onError) {
		return await fetchApi(
				localization,
				onError,
				axios => axios.post('transport-companies/payment-methods/store', data),
				errorNames,
		);
	},
	
	async update(localization, id, data, errorNames, onError) {
		return await fetchApi(
				localization,
				onError,
				axios => axios.patch(`transport-companies/payment-methods/${id}`, data),
				errorNames,
		);
	},
	
	async setOrder(localization, data, onError) {
		return await fetchApi(
				localization,
				onError,
				axios => axios.post('transport-companies/payment-methods/order', data),
				[],
		);
	},
	
	async remove(localization, id, onError) {
		return await fetchApi(
				localization,
				onError,
				axios => axios.delete(`transport-companies/payment-methods/${id}`),
				['price_type_id', 'names.0.value', 'is_default'],
		);
	},
	
	async getBlockedSections(localization, id, onError) {
		return await fetchApi(
				localization,
				onError,
				axios => axios.get(`transport-companies/payment-methods/${id}/blocked-sections`),
		);
	},
	
	async setBlockedSections(localization, id, data, onError) {
		return await fetchApi(
				localization,
				onError,
				axios => axios.post(`transport-companies/payment-methods/${id}/blocked-sections`, data),
		);
	},
};

export default paymentMethodsService;
