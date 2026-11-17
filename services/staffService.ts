import fetchApi from '../network/fetchEndpoint';

export default {
	async getStaffs(localization: string, errors: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			errors,
			axios => axios.get('/staff/all'),
		);
	},

	async getStaffsByGroup(localization: string, groupId: number, errors: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			errors,
			axios => axios.get(`/staff/all/${groupId}`),
		);
	},

	async getStaff(localization: string, id: number, errors: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			errors,
			axios => axios.get(`staff/profile/${id}`),
		);
	},

	async createStaff(localization: string, data: object, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('staff/store/', data),
			['email', 'phone'],
		);
	},

	async updateStaff(localization: string, staffId: number, data: object, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`staff/update/${staffId}`, data),
			['email', 'phone'],
		);
	},

	async blockStaff(localization: string, staffId: number, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			null,
			onError,
			axios => axios.patch(`staff/block/${staffId}`),
		);
	},
	async unBlockStaff(localization: string, staffId: number, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			null,
			onError,
			axios => axios.patch(`staff/unblock/${staffId}`),
		);
	},

	async updatePassword(localization: string, staffId: number, password, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(
			null,
			onError,
			axios => axios.patch(`staff/set-password/${staffId}`, password),
		);
	},
};
