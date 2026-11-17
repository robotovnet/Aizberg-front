import fetchApi from '../network/fetchEndpoint';

const bonusProgramService = {

	async getAll(localization, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('masks/phones/all'),
		);
	},
};

export default bonusProgramService;
