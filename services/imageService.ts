import fetchApi from '../network/fetchEndpoint'

export default {
	async saveImage(localization, userId, imageData, errors: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(localization, errors,
			axios => axios.post(`staff/upload-userpic/${userId}`, imageData, {headers: {'Content-Type': 'multipart/form-data'}}), ['userpic'])
	},

	async saveTransportCompanyIcon(localization, transportCompanyId, imageData, errors: (errMsg: string, errCode: number, type?: string) => void = () => {
	}) {
		return await fetchApi(localization, errors,
			axios => axios.post(`transport-companies/${transportCompanyId}/icon`, imageData, {headers: {'Content-Type': 'multipart/form-data'}}), ['icon'])
	},
}
