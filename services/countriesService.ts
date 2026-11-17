import fetchApi from '../network/fetchEndpoint';
import type { ApiService } from '../types/service';

const countriesService: ApiService = {

	async getAll(localization, onError, search = '') {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('countries/all?search=' + search),
		);
	},

	async get(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`countries/${id}`),
		);
	},

	async create(localization, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('countries/store', data),
			errorNames,
		);
	},

	async update(localization, id, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`countries/${id}`, data),
			errorNames,
		);
	},

	async remove(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`countries/${id}`),
			['price_type_id', 'names.0.value', 'is_default'],
		);
	},
};

export default countriesService;
