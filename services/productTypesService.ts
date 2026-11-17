import fetchApi from '../network/fetchEndpoint';
import { ApiServiceWithFeatures } from '../types/service';

const productTypesService: ApiServiceWithFeatures = {
	async getAll(localization, onError = () => {}, search = '') {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('catalog/groups/all?search=' + search),
		);
	},

	async get(localization, id, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`catalog/groups/${id}`),
		);
	},

	async create(localization, data, errors, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('catalog/groups/store', data),
			errors,
		);
	},

	async update(localization, id, data, errors, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`catalog/groups/${id}`, data),
			errors,
		);
	},

	async remove(localization, id, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`catalog/groups/${id}`),
			['names.0.value'],
		);
	},

	async getAllFeatures(localization, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('catalog/features/all'),
		);
	},
};

export default productTypesService;
