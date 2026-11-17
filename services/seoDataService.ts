import fetchApi from '../network/fetchEndpoint';

const seoDataService = {
	
	async update(localization, id, data, onError) {
		return await fetchApi(
				localization,
				onError,
				axios => axios.patch(`catalog/sections/${id}/seo`, data), ['seo.starting_phrases', 'seo.desc', ]
		);
	},
	
};

export default seoDataService;
