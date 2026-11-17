import fetchApi from '../network/fetchEndpoint';
import type { CatalogFeaturesService } from '../types/service';

const catalogFeaturesService: CatalogFeaturesService = {

	async getAll(localization: string | object, onError = () => {}, search = '') {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('catalog/features/all?search=' + search),
		);
	},

	async get(localization, id, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`catalog/features/${id}`),
		);
	},

	async create(localization, data, errors, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('catalog/features/store', data),
			errors,
		);
	},

	async update(localization, id, data, errors, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`catalog/features/${id}`, data),
			errors,
		);
	},

	async remove(localization, id, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`catalog/features/${id}`),
			['names.0.value'],
		);
	},

	async getValues(localization, featureId, onError = () => {}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`catalog/features/values/${featureId}`),
		);
	},

	async migrateValues(localization, data, errors, onError = () => {}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('catalog/features/migrate-values', data),
			errors,
		);
	},

	async getProductsByValue(localization, featureId, data, errors, onError = () => {}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post(`catalog/features/products-by-value/${featureId}`, data),
			errors,
		);
	},
};

export default catalogFeaturesService;
