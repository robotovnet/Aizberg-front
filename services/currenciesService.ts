import fetchApi from '../network/fetchEndpoint';
import type { ApiService } from '../types/service';

const currenciesService: ApiService = {

	async getAll(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('currencies/all'),
		);
	},

	async get(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`currencies/${id}`),
		);
	},

	async create(localization, data, errorNames, onError) {


		return await fetchApi(
			localization,
			onError,
			axios => axios.post('currencies/store', data),
			errorNames,
		);
	},

	async update(localization, id, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`currencies/${id}`, data),
			errorNames,
		);
	},

	async remove(localization, id, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`currencies/${id}`),
			['names.0.value'],
		);
	},
};

export default currenciesService;
