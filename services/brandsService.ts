import fetchApi from '../network/fetchEndpoint';
import type { ApiService } from '../types/service';

const brandsService: ApiService = {

	async getAll(localization, onError, search = '') {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('catalog/brands/all?search=' + search),
		);
	},

	async getAllWithoutHidden(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('catalog/brands/all?is_hidden=true'),
		);
	},
	
	async get(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`catalog/brands/${id}`),
		);
	},

	async create(localization, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('catalog/brands/store', data),
			errorNames,
		);
	},

	async update(localization, id, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`catalog/brands/${id}`, data),
			errorNames,
		);
	},

	async remove(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`catalog/brands/${id}`),
			['country_code', 'official_website', 'desc', 'is_hidden', 'names', 'names.0.value', 'brand'],
		);
	},
};

export default brandsService;
