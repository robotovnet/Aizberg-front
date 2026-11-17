import fetchApi from '../network/fetchEndpoint';
import type { CatalogSectionsService } from '../types/service';

const catalogSectionsService: CatalogSectionsService = {
	async getAll(localization, onError = () => {}, addParam = '') {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('catalog/sections/all' + addParam),
		);
	},

	async get(localization, id, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`catalog/sections/${id}`),
		);
	},

	async create(localization, data, errorNames, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('catalog/sections/store', data),
			errorNames,
		);
	},

	async changeOrder(localization, data, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('catalog/sections/order', data),
		);
	},

	async saveImage(localization, id, imageData, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post(`catalog/sections/${id}/icon`, imageData, {headers: {'Content-Type': 'multipart/form-data'}}),
			['userpic'],
		);
	},

	async update(localization, id, data, errorNames, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`catalog/sections/${id}`, data),
			errorNames,
		);
	},

	async remove(localization, id, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`catalog/sections/${id}`),
		);
	},
};

export default catalogSectionsService;
