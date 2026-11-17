import fetchApi from '../network/fetchEndpoint';
import type { MatrixTypesService } from '../types/service';

const matrixTypesService: MatrixTypesService = {

    async getAll(localization, onError) {
        return await fetchApi(
            localization,
            onError,
            axios => axios.get('matrix-type'),
        );
    },

    async get(localization, id, onError) {
        return await fetchApi(
            localization,
            onError,
            axios => axios.get(`matrix-type/${id}`),
        );
    },

    async create(localization, data, errorNames, onError) {
        return await fetchApi(
            localization,
            onError,
            axios => axios.post('matrix-type', data),
            errorNames,
        );
    },

    async update(localization, id, data, errorNames, onError) {
        return await fetchApi(
            localization,
            onError,
            axios => axios.put(`matrix-type/${id}`, data),
            errorNames,
        );
    },

    async remove(localization, id, onError) {
        return await fetchApi(
            localization,
            onError,
            axios => axios.delete(`matrix-type/${id}`),
            ['names.0.value'],
        );
    },

    async getProductMatrixTypeId(localization, id, onError) {
        return await fetchApi(
            localization,
            onError,
            axios => axios.get(`matrix-type/product/${id}`),
        );
    },
};

export default matrixTypesService;
