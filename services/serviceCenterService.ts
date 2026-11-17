import fetchApi from '../network/fetchEndpoint';

export default {
	async getItems(localization, page, city_id, onError) {
		return await fetchApi(localization, onError, axios => axios.get(`service-centers/all?page=${page}&city_id=${city_id}`));
	},
	async getAll(
		localization: string | object,
		page: string | number,
		city_id: string | number,
		onError: (errMsg: string, errCode: number, type?: string) => void = () => {},
	) {
		return await fetchApi(localization, onError, axios => axios.get(`service-centers/all?page=${page}&city_id=${city_id}`));
	},

	async get(
		localization: string | object,
		id: string | number,
		onError: (errMsg: string, errCode: number, type?: string) => void = () => {},
	) {
		return await fetchApi(localization, onError, axios => axios.get(`service-centers/${id}`));
	},

	async total(
		localization: string | object,
		cityId: string | number,
		onError: (errMsg: string, errCode: number, type?: string) => void = () => {},
	) {
		return await fetchApi(localization, onError, axios => axios.get(`service-centers/total?city_id=${cityId}`));
	},

	async create(
		localization: string | object,
		data: object,
		onError: (errMsg: string, errCode: number, type?: string) => void = () => {},
	) {
		return await fetchApi(localization, onError, axios => axios.post('service-centers/store', data), [
			'address',
			'address_comment',
			'city_id',
			'country_id',
			'lat',
			'lng',
			'metro_station',
			'name',
			'site',
			'phone',
			'postal_code',
			'work_time',
		]);
	},

	async update(
		localization: string | object,
		id: string | number,
		data: object,
		onError: (errMsg: string, errCode: number, type?: string) => void = () => {},
	) {
		return await fetchApi(localization, onError, axios => axios.patch(`service-centers/${id}`, data), [
			'address',
			'address_comment',
			'city_id',
			'country_id',
			'lat',
			'lng',
			'metro_station',
			'name',
			'site',
			'phone',
			'postal_code',
			'work_time',
		]);
	},

	async remove(localization: string, id, onError: (errMsg: string, errCode: number, type?: string) => void = () => {}) {
		return await fetchApi(localization, onError, axios => axios.delete(`service-centers/${id}`));
	},

	async getCities(localization, onError: (errMsg: string, errCode: number, type?: string) => void = () => {}) {
		return await fetchApi(localization, onError, axios => axios.get('service-centers/cities'));
	},
};
