import fetchApi from '../network/fetchEndpoint';
import type { BonusProgramService } from '../types/service';

const bonusProgramService: BonusProgramService = {

	async getAll(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('bonus-program/all'),
		);
	},

	async get(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get(`bonus-program/${id}`),
		);
	},

	async create(localization, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('bonus-program/store', data),
			errorNames,
		);
	},

	async update(localization, id, data, errorNames, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`bonus-program/${id}`, data),
			errorNames,
		);
	},

	async remove(localization, id, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.delete(`bonus-program/${id}`),
		);
	},

	async getBlockedSections(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('bonus-program/blocked-sections'),
		);
	},

	async setBlockedSections(localization, data, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('bonus-program/blocked-sections', data),
		);
	},

	async getEstimatedNumber(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.get('settings/get-by-code/BP_CALC_DAY'),
		);
	},

	async setEstimatedNumber(localization, id, data, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.patch(`settings/${id}`, data),
		);
	},
};

export default bonusProgramService;
