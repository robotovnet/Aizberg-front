import fetchApi from "../network/fetchEndpoint";

export default {

    async getAll(localization: string, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
    }) {
        return await fetchApi(localization, onError,
            axios => axios.get(`client-types/all`))
    },

    async get(localization: string, id, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
    }) {
        return await fetchApi(localization, onError,
            axios => axios.get(`client-types/${id}`))
    },

    async create(localization: string, data, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
    }) {
        return await fetchApi(localization, onError,
            axios => axios.post(`client-types/store`, data),   ['price_type_id', 'names.0.value', 'is_default'])
    },

    async update(localization: string, id,  data, onError: (errMsg: string, errCode: number, type?: string) => void = () => {
    }) {
        return await fetchApi(localization, onError,
            axios => axios.patch(`client-types/${id}`, data), ['price_type_id', 'names.0.value', 'is_default'])
    },

    async remove(localization: string, id,  onError: (errMsg: string, errCode: number, type?: string) => void = () => {
    }) {
        return await fetchApi(localization, onError,
            axios => axios.delete(`client-types/${id}`), ['price_type_id', 'names.0.value', 'is_default'])
    },

}
