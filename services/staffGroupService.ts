import fetchApi from '../network/fetchEndpoint'


export default {

    async getGroups(localization, errors: (errMsg: string, errCode: number, type?: string) => void = () => {
    }) {
        return await fetchApi(localization, errors,
            axios => axios.get(`staff/groups`))
    },

}