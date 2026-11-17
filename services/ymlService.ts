import fetchApi from '../network/fetchEndpoint';
import type { YandexYml } from '../types/service';

const ymlsService: YandexYml = {

	async getAll(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('ad/ymls/all'),
		);
	},

	async get(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`ad/ymls/${id}`),
		);
	},

	async create(localization, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('ad/ymls/store', data),
			errorNames,
		);
	},

	async update(localization, id, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`ad/ymls/${id}`, data),
			errorNames,
		);
	},

	async remove(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`ad/ymls/${id}`),
		);
	},
	async getSections(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('ad/ymls/sections'),
		);
	},
	async setSections(localization, data, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('ad/ymls/sections', data),
		);
	},
};

export default ymlsService;
