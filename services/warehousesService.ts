import fetchApi from '../network/fetchEndpoint';
import type { ApiService } from '../types/service';

const warehousesService: ApiService = {
	async getAll(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('transport-companies/warehouses/all'),
		);
	},

	async get(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`transport-companies/warehouses/${id}`),
		);
	},

	async create(localization, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('transport-companies/warehouses/store', data),
			errorNames,
		);
	},

	async update(localization, id, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`transport-companies/warehouses/${id}`, data),
			errorNames,
		);
	},

	async remove(localization: string | object, id, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`transport-companies/warehouses/${id}`),
		);
	},
};

export default warehousesService;
