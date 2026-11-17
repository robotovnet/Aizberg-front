import { ref, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import sleep from '../../../utils/sleep';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';

export default function useDeleteHandler(service) {
	const toast = inject('toast') as any;
	const store = useStore<MainState>();
	const localization: any = useI18n();
	const itemId = ref();
	const itemName = ref();
	const marker = ref(true);
	const onDelete = async (id) => {
		store.commit('setLoading', true);
		const response = await service.remove(localization, id, errMsg => toaster.error(toast, errMsg));
		
		if (response.message === 'success') {
			marker.value = !marker.value;
		}
		
		store.commit('setLoading', false);
	};

	const onConfirmDelete = async (id, name) => {
		itemName.value = name;
		itemId.value = undefined;
		await sleep(1);
		itemId.value = id;
	};

	return {
		marker,
		itemId,
		itemName,
		onDelete,
		onConfirmDelete,
	};
}
