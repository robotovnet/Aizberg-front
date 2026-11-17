import fetchApi from '../network/fetchEndpoint';
import { ApiService } from '../types/service';

const priceTypesService: ApiService = {

	async getAll(localization, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.get('price-types/all'));
	},

	async get(localization, id, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.get(`price-types/${id}`));
	},

	async create(localization, data, errorNames = [''], onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.post('price-types/store', data), errorNames);
	},

	async update(localization, id, data, errorNames = [''], onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.patch(`price-types/update/${id}`, data), errorNames);
	},

	async remove(localization, id, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.delete(`price-types/${id}`));
	},

};

export default priceTypesService;
