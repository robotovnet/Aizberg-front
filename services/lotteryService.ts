import fetchApi from '../network/fetchEndpoint';

export default {
	//Tickets
	async getTotalRegTickets(localization, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.get('lottery/tickets/total-reg-tickets'));
	},
	async startGeneration(localization, data, errorNames, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.post('lottery/tickets/generator', data), errorNames);
	},
	async getGenerationsList(localization, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.get('lottery/tickets/generations'));
	},

	//Prize
	async getPrizeList(localization, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.get('lottery/prize/all'));
	},
	async createPrize(localization, data, errorNames, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.post('lottery/prize/add', data), errorNames);
	},
	async deletePrize(localization, id, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.delete(`lottery/prize/delete/${id}`));
	},

	//Applications
	async getApplicationsList(localization, orderBy = null, onError = () => {}) {
		const params = orderBy ? { orderBy } : {};
		return await fetchApi(localization, onError, axios => axios.get('lottery/apps/all', { params }));
	},
	async getApplicationDetails(localization, id, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.get(`lottery/apps/detail/${id}`));
	},
	async acceptApplication(localization, id, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.post(`lottery/apps/accept/${id}`));
	},
	async rejectApplication(localization, id, rejectDesc, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.post(`lottery/apps/reject/${id}`, { rejectDesc }));
	},
	async getTotalApplications(localization, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.get('lottery/apps/total'));
	},
	async getActiveParticipantsCount(localization, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.get('lottery/participants/count'));
	},

	//Draws
	async getDrawsList(localization, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.get('lottery/draws/all'));
	},
};
