import fetchApi from '../network/fetchEndpoint';
import type { ApiService } from '../types/service';

const tiledService = {

	async shouldDisplay(localization, id, data, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post(`catalog/sections/${id}/main-page`, data),
		);
	},

	async setOrder(localization, data, onError) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('catalog/sections/tiled-order', data),
		);
	},

};

export default tiledService;
