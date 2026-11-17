import fetchApi from '../network/fetchEndpoint';
import type { ApiService } from '../types/service';

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

const realProjectsService: ApiService = {

	async getAll(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('real-projects'),
		);
	},

	async get(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`real-projects/${id}`),
		);
	},

	// data — FormData с полями name, url, sort и файлом banner
	async create(localization, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('real-projects', data, multipart),
			errorNames,
		);
	},

	// POST, а не PUT: PHP не разбирает multipart/form-data в PUT-запросах
	async update(localization, id, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post(`real-projects/${id}`, data, multipart),
			errorNames,
		);
	},

	async remove(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`real-projects/${id}`),
		);
	},
};

export default realProjectsService;
