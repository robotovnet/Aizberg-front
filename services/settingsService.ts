import fetchApi from '../network/fetchEndpoint';

export default {

	async getAll(localization: string, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('settings/all'),
		);
	},

	async update(localization: string, id: string | number, data: object, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`settings/${id}`, data),
		);
	},
};
