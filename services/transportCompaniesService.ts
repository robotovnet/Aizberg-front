import fetchApi from '../network/fetchEndpoint';

export default {

	async getAll(localization: string | object, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('transport-companies/all'),
		);
	},

	async get(localization: object, staffId: string, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`transport-companies/${staffId}`),
		);
	},

	async sort(localization: string, data: object, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		const response = await fetchApi(
			localization,
			onError,
			axios => axios.post('transport-companies/order', data),
		);
	},

	async create(localization: object, data: object, errorNames: string[], onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('transport-companies/store', data),
			errorNames,
		);
	},

	async remove(localization: string, id, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`transport-companies/${id}`),
		);
	},

	async update(localization: object, id, data, errorNames, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`transport-companies/${id}`, data),
			errorNames,
		);
	},

	async createDeliverySettings(localization: string | object, data: object, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post(`transport-companies/delivery-settings/store`, data), [
			'copy_settings',
			'days_transfer',
			'delivery_point_id',
			'delivery_type',
			'transfer_time_after_tomorrow',
			'transfer_time_tomorrow',
			'transport_company_id',
		],
		);
	},

	async updateDeliverySettings(localization: string | object, id: string | number, data: object, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`transport-companies/delivery-settings/${id}`, data), [
			'copy_settings',
			'days_transfer',
			'delivery_point_id',
			'delivery_type',
			'transfer_time_after_tomorrow',
			'transfer_time_tomorrow',
			'transport_company_id',
		],
		);
	},

	async getCitiesWitPickUpPoints(localization: string | object, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('transport-companies/pickup-points/cities'),
		);
	},

	async getCitiesWithPostamatss(localization: string | object, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('transport-companies/postamats/cities'),
		);
	},

	shippingRatesErrorNames(): string[] {
		const names = ['transport_company_id', 'shipping_methods', 'rates'];
		for (let i = 0; i < 50; i++) {
			names.push(`rates.${i}.value`, `rates.${i}.minimum_order_value`, `rates.${i}.maximum_order_value`);
		}
		return names;
	},

	async getShippingRates(
		localization: string | object,
		shippingCostId: string | number,
		onError: (errMsg: string, errCode: number, type?: string) => void = () => {
		},
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`transport-companies/shipping-rates/${shippingCostId}`),
		);
	},

	async updateShippingRates(
		localization: string | object,
		shippingCostId: string | number,
		data: object,
		onError: (errMsg: string, errCode: number, type?: string) => void = () => {
		},
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`transport-companies/shipping-rates/${shippingCostId}`, data),
			this.shippingRatesErrorNames(),
		);
	},
};
