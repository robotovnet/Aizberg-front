import fetchApi from '../network/fetchEndpoint';
import type { YandexWordstatService } from '../types/service';

const yandexWordstatService: YandexWordstatService = {
  async getTasksInWork(localization, onError) {
    return await fetchApi(
      localization,
      onError,
      axios => axios.get(`yandex-wordstat/tasksInWork`)
    );
  },

  async uploadExcel(localization, file, onError) {
    return await fetchApi(
      localization,
      onError,
      axios => axios.post(`yandex-wordstat/uploadExcel`, file, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );
  },

  async getBalance(localization, onError) {
    return await fetchApi(
      localization,
      onError,
      axios => axios.get(`yandex-wordstat/balance`)
    );
  },

  async clearStatistics(localization, onError) {
    return await fetchApi(
      localization,
      onError,
      axios => axios.get(`yandex-wordstat/clearStat`)
    );
  },

  async clearJobs(localization, onError) {
    return await fetchApi(
      localization,
      onError,
      axios => axios.get(`yandex-wordstat/clearJobs`)
    );
  },
}

export default yandexWordstatService;