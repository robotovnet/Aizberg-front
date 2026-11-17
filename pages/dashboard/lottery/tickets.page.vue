<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit">
		<div class="main__content">
			<h2 class="main__title">{{ $t('text.active_tickets') }}: {{ activeTicketsCount }}</h2>
		</div>

		<!-- Секция генерации билетов -->
		<TicketGenerator 
			v-if="canEdit" 
			:isGenerating="isGenerating" 
			v-model:ticketsCount="ticketsCount"
			@generate="generateTickets"
		/>

		<!-- Список сгенерированных билетов -->
		<TicketsList :generations-list="generationsList" />
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, onBeforeMount, onMounted } from 'vue';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import redirect from '../../../utils/redirect';
import lotteryService from '../../../services/lotteryService';
import TicketGenerator from '../../_components/dashboard/lottery/TicketGenerator.vue';
import TicketsList from '../../_components/dashboard/lottery/TicketsList.vue';

// Типы
interface GenerationData {
	total_tickets: number;
}

interface GenerationItem {
	generation_id: number;
	tickets_count: number;
	created_at: string | null;
}

// Композиция
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const { canEdit } = usePageInit('lottery');

// Состояние
const ticketsCount = ref<number>(1);
const isGenerating = ref<boolean>(false);
const generationsList = ref<Array<GenerationItem>>([]);
const activeTicketsCount = ref<number>(0);
// Методы
const fetchGenerationsList = async (): Promise<void> => {
	try {
		const data = await lotteryService.getGenerationsList(localization);
		generationsList.value = data;
	} catch (error) {
		toaster.error(toast, 'Ошибка при получении списка генераций');
	}
};

const fetchActiveTicketsCount = async (): Promise<void> => {
	const data = await lotteryService.getTotalRegTickets(localization);
	activeTicketsCount.value = data.total_registered_tickets;
};



const generateTickets = async (): Promise<void> => {
	if (isGenerating.value) return;

	try {
		isGenerating.value = true;
		store.commit('setLoading', true);
		toaster.success(toast, 'Генерация билетов запущена');

		const data: GenerationData = {
			total_tickets: ticketsCount.value,
		};

		await lotteryService.startGeneration(localization, data);
		toaster.success(toast, 'Генерация билетов завершена');
		await fetchGenerationsList();
	} catch (error) {
		toaster.error(toast, 'Ошибка при генерации билетов');
	} finally {
		isGenerating.value = false;
		store.commit('setLoading', false);
	}
};

// Инициализация
const pageInit = async (): Promise<void> => {
	if (!canEdit.value) {
		return redirect('/dashboard');
	}

	store.commit('setLoading', true);
	await fetchGenerationsList();
	store.commit('setLoading', false);
};

onBeforeMount(pageInit);
onBeforeMount(fetchActiveTicketsCount);

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>

<style></style>
