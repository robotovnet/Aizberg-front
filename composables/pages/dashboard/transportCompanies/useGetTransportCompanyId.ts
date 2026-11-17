import { ref, inject } from 'vue';
import { onMounted } from '@vue/runtime-core';

export default function useGetTransportCompanyId() {
	const tcId = ref();

	const checkUrlParams = () => {
		const urlParams = new URLSearchParams(window.location.search);
		const tcIdParam = urlParams.get('tc_id');
		if (tcIdParam !== null) {
			tcId.value = +tcIdParam;
		}
	};

	onMounted(() => {
		checkUrlParams();
	});

	return {
		tcId,
	};
}
