import { inject } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import { ApiService } from '../../../types/service';
import sleep from '../../../utils/sleep';

export default function useCreateOrUpdate(service: ApiService | any, errorNames: string[], redirectUrl?: string) {
	const store = useStore<MainState>();
	const toast = inject('toast') as any;
	const localization: any = useI18n();

	const create = async (sendData: object, errNames: string[] = errorNames) => {
		await sleep(1)
		store.commit('setLoading', true);
		const response: any = await service.create(localization, sendData, errNames, errMsg => {
			toaster.error(toast, errMsg);
			store.commit('setLoading', false);
		});
		if (response.message === 'success') {
			toaster.success(toast, localization.t('text.generalSuccessCreated'));
			if (redirectUrl) window.location.replace(redirectUrl);
		}
		store.commit('setLoading', false);
		return response;
	};

	const update = async (id: number | string, sendData: object) => {
		await sleep(1)
		store.commit('setLoading', true);
		const response: any = await service.update(localization, id, sendData, errorNames, errMsg => {
			toaster.error(toast, errMsg);
			store.commit('setLoading', false);
		});
		if (response.message === 'success') {
			toaster.success(toast, localization.t('text.generalSuccessUpdated'));
			window.location.replace(redirectUrl);
		}
		store.commit('setLoading', false);
	};
	return {
		create,
		update,
	};
}

// const response = await catalogFeaturesService.update(localization, id, sendData, errorNames, (errMsg, _, type) => {
//     apiErrors.value = {errors: {...apiErrors.errors, [type as any]: [errMsg]}}
//     store.commit('setLoading', false)
//     return
// })
