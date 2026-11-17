import fetchApi from '../network/fetchEndpoint';

export default {

	async saveName(localization: string, data, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch('staff/profile/name', data),
			['email', 'phone'],
		);
	},

	async saveUserpic(localization: string, data, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('staff/profile/userpic', data, {headers: {'Content-Type': 'multipart/form-data'}}),
			['userpic'],
		);
	},

	async sendCodeToPhone(localization: string, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('staff/profile/phone'),
			['phone', 'email', 'code'],
		);
	},
	async sendCodeWithEmail(localization: string, data, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch('staff/profile/email', data),
			['phone', 'email', 'code'],
		);
	},
	async sendCodeToEmail(localization: string, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('staff/profile/email'),
			['phone', 'email', 'code'],
		);
	},
	async sendCodeWithPhone(localization: string, data, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch('staff/profile/phone', data),
			['phone', 'email', 'code'],
		);
	},
	async updatePassword(localization: string, data, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch('staff/profile/password', data),
			['phone', 'email', 'code'],
		);
	},

};
