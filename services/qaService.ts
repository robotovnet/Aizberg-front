import fetchApi from '../network/fetchEndpoint';
import type { OneClickOrder } from '../types/service';

const qaService = {
    async getAll(
	localization,
	page,
	queryString,
	onError,
    ) {
	return await fetchApi(
	    localization,
	    onError,
	    axios => axios.get(`qa/all?page=${page}${queryString}`),
	);
    },	
    async total(
	localization,
	queryString,
	onError,
    ) {
	return await fetchApi(
	    localization,
	    onError,
	    axios => axios.get(`qa/all?${queryString}&onlyCount=yes`),
	);
    },
    async answer(localization, answer, qaId, onError = () => {}) {
	return await fetchApi(localization, onError, axios => axios.post(`qa/answer/${qaId}`, {answer: answer}));
    },

    async delete(localization, qaId, onError = () => {}) {
	return await fetchApi(localization, onError, axios => axios.delete(`qa/${qaId}`));
    },
};

export default qaService;
