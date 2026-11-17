import fetchApi from '../network/fetchEndpoint';
import { ApiServiceWithFiltersCount } from '../types/service';

const apiServiceWithFiltersCount: ApiServiceWithFiltersCount = {

	async getAll(localization, onError = () => {}, search = '') {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('catalog/filters/all?search=' + search),
		);
	},

	async get(localization, id, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`catalog/filters/${id}`),
		);
	},

	async getFiltersCount(localization, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('catalog/filters/total_by_product_group'),
		);
	},

	async create(localization, data, errors, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('catalog/filters/store', data),
			errors,
		);
	},

	async update(localization, id, data, errors, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`catalog/filters/update-many`, data),
			errors,
		);
	},

	async remove(localization, id, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`catalog/filters/by-group/${id}`),
		);
	},
};

export default apiServiceWithFiltersCount;
