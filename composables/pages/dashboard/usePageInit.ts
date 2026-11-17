import { ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { MainState } from '../../../store/mainStore';

export default function usePageInit(alias: string) {
	const itemId = ref();
	const isEditMode = ref();
	const store = useStore<MainState>();

	const canViewOrEdit = (permissions: any, alias) => {
		permissions = store.state.userProfile.permissions;
		if (permissions) {
			const inc = permissions.filter(permission => permission.policy === alias);
			return inc[0]?.policy === alias;
		}
		return false;
	};

	const canView = ref();
	const canEdit = ref();
	onBeforeMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		itemId.value = urlParams.get('edit');
		isEditMode.value = !!(itemId.value);
		canView.value = canViewOrEdit(store.state.userProfile.permissions, `${alias}.view`);
		canEdit.value = canViewOrEdit(store.state.userProfile.permissions, `${alias}.management`);
		if (!canView.value) window.location.replace('/dashboard');
	});

	return {
		canEdit,
		canView,
		itemId,
		isEditMode,
	};
}
