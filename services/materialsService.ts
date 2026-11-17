import fetchApi from '../network/fetchEndpoint';
import type { MaterialsService } from '../types/service';

const materialsService: MaterialsService = {

	async getAll(localization, onError, search = '') {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('materials/all?search=' + search),
		);
	},

	async get(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`materials/${id}`),
		);
	},
	async getSectionsOfMaterials(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`materials/sections`),
		);
	},

	async create(localization, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('materials/store', data),
			errorNames,
		);
	},

	async update(localization, id, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`materials/${id}`, data),
			errorNames,
		);
	},

	async remove(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`materials/${id}`),
		);
	},
};

export default materialsService;
