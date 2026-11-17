import fetchApi from '../network/fetchEndpoint';
import { ApiServiceWithPagination } from '../types/service';

const deliveryCitiesService: ApiServiceWithPagination = {
	async getAllWithPagination(localization, page, tcId, method, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`transport-companies/courier-cities/?page=${page}&tc_id=${tcId}&adding_method=${method}`),
		);
	},

	async getAll(localization, onError = () => {}, search = '') {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('transport-companies/courier-cities/?search=' + search),
		);
	},

	async get(localization, id, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`transport-companies/courier-cities/${id}`),
		);
	},

	async create(localization, data, errorNames, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('transport-companies/courier-cities/store', data),
			errorNames
		);
	},

	async update(localization, id, data, errorNames, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`transport-companies/courier-cities/${id}`, data),
			errorNames
		);
	},

	async remove(localization: string | object, id: string | number, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`transport-companies/courier-cities/${id}`),
		);
	},

	async totalCities(localization: string | object, tcId, method, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`transport-companies/courier-cities/total?tc_id=${tcId}&adding_method=${method}`),
		);
	},
};

export default deliveryCitiesService;
