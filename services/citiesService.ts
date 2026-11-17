import fetchApi from '../network/fetchEndpoint';
import type { Cities } from '../types/service';

const citiesService: Cities = {

	async getAll(localization, onError, search = '') {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('cities/all?search=' + search),
		);
	},

	async getAllWithPagination(localization, page, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`cities/all?page=2${page}`),
		);
	},

	async getAllinCountryWithPagination(localization, page, code, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post(`cities/${code}/all?page=${page}`),
		);
	},

	async get(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`cities/${id}`),
		);
	},

	async create(localization, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('cities/store', data),
			errorNames,
		);
	},

	async update(localization, id, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`cities/${id}`, data),
			errorNames,
		);
	},

	async remove(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`cities/${id}`),
		);
	},

	async totalCities(localization: string | object, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('cities/total'),
		);
	},

	async totalCitiesInCountry(localization: string | object, code, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`cities/total?country_code=${code}`),
		);
	},
};

export default citiesService;
