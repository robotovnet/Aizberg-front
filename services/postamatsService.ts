import fetchApi from '../network/fetchEndpoint';
import type { PostamatsService } from '../types/service';

const postamatsService: PostamatsService = {

	async getItems(
		localization,
		page,
		city_id,
		transportCompanyId,
		adding_method,
		onError,
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`transport-companies/postamats?page=${page}&city_id=${city_id}&tc_id=${transportCompanyId}&adding_method=${adding_method}`),
		);
	},
	async getAll(
		localization,
		onError = () => {
		},
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('transport-companies/postamats?page=0&city_id=0&tc_id=0&adding_method=all'),
		);
	},

	async get(
		localization,
		id,
		onError = () => {
		},
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`transport-companies/postamats/${id}`),
		);
	},

	async total(
		localization: string | object,
		cityId: string | number,
		transportCompanyId: string | number,
		addingMethod: string,
		onError: (errMsg: string, errCode: number, type?: string) => void = () => {
		},
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(
				`transport-companies/postamats/total?city_id=${cityId}&tc_id=${transportCompanyId}&adding_method=${addingMethod}`,
			),
		);
	},

	async updatePickUpPointSettings(
		localization: string | object,
		id: string | number,
		data: object,
		onError: (errMsg: string, errCode: number, type?: string) => void = () => {
		},
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`transport-companies/delivery-settings/${id}`, data),
		);
	},

	async create(
		localization,
		data,
		errorNames,
		onError = () => {
		},
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('transport-companies/postamats/store', data),
			errorNames,
		);
	},

	async update(localization, id, data, errorNames, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`transport-companies/postamats/${id}`, data),
			errorNames,
		);
	},

	async remove(localization, id, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`transport-companies/postamats/${id}`),
		);
	},

	async getCities(localization, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('transport-companies/postamats/cities'),
		);
	},
};

export default postamatsService;
