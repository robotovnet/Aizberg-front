import fetchApi from '../network/fetchEndpoint';
import type { ClientsService } from '../types/service';

const clientsService: ClientsService = {

	async getAll(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('clients/all?'),
		);
	},

	async getAllWithFilters(localization, page, queryString, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`clients/all?page=${page}${queryString}`),
		);
	},

	async total(localization, filterString, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`clients/all?${filterString}&onlyCount=y`),
		);
	},

	async get(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`clients/profile/${id}`),
		);
	},
	async getCitiesWithClients(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('cities/all/clients'),
		);
	},
	async update(localization, id, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`clients/profile/${id}`, data),
			errorNames,
		);
	},
	async registration(localization, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('clients/registration', data),
			errorNames,
		);
	},

	async remove(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`clients/${id}`),
		);
	},
};

export default clientsService;
