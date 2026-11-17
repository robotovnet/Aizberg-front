import fetchApi from '../network/fetchEndpoint';

export default {
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
			axios => axios.get(`transport-companies/pickup-points?page=${page}&city_id=${city_id}&tc_id=${transportCompanyId}&adding_method=${adding_method}`),
		);
	},
	async getAll(
		localization: string | object,
		page: string | number,
		city_id: string | number,
		transportCompanyId: string | number,
		adding_method: string,
		onError: (errMsg: string, errCode: number, type?: string) => void = () => {
		},
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(
				`transport-companies/pickup-points/?page=${page}&city_id=${city_id}&tc_id=${transportCompanyId}&adding_method=${adding_method}`,
			),
		);
	},

	async get(localization: string | object, id: string | number, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`transport-companies/pickup-points/${id}`),
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
				`transport-companies/pickup-points/total?city_id=${cityId}&tc_id=${transportCompanyId}&adding_method=${addingMethod}`,
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
		localization: string | object,
		data: object,
		onError: (errMsg: string, errCode: number, type?: string) => void = () => {
		},
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('transport-companies/pickup-points/store', data),
			[
				'adding_method',
				'address',
				'address_comment',
				'city_id',
				'country_id',
				'lat',
				'lng',
				'metro_station',
				'name',
				'payment_by_card',
				'payment_by_cash',
				'phone',
				'postal_code',
				'transport_companies',
				'work_time',
			],
		);
	},

	async update(
		localization: string | object,
		id: string | number,
		data: object,
		onError: (errMsg: string, errCode: number, type?: string) => void = () => {
		},
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`transport-companies/pickup-points/${id}`, data),
			[
				'adding_method',
				'address',
				'address_comment',
				'city_id',
				'country_id',
				'lat',
				'lng',
				'metro_station',
				'name',
				'payment_by_card',
				'payment_by_cash',
				'phone',
				'postal_code',
				'transport_companies',
				'work_time',
			],
		);
	},

	async remove(localization: string, id, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`transport-companies/pickup-points/${id}`),
		);
	},

	async getCities(localization, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('transport-companies/pickup-points/cities'),
		);
	},

};
