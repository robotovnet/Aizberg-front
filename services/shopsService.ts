import fetchApi from '../network/fetchEndpoint';
import type { ApiService } from '../types/service';

const shopsService: ApiService = {

	async getAll(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('shops/all'),
		);
	},

	async get(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`shops/${id}`),
		);
	},

	async create(localization, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('shops/store', data),
			errorNames,
		);
	},

	async update(localization, id, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`shops/${id}`, data),
			errorNames,
		);
	},

	async remove(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`shops/${id}`),
		);
	},
};

export default shopsService;
