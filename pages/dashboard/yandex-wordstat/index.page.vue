<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit" v-if="canView">
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.balanceLabel') }}</span>
				<div class="flex__column">{{ balance }} {{ $t('text.rubles') }}</div>
			</div>
            <div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.tasksInWorkLabel') }}</span>
				<div class="flex__column">{{ tasksInWork }} {{ $t('text.pieces') }}</div>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.statisticsCollected') }}</span>
				<div class="flex__column">{{ statisticsCollected }} {{ $t('text.pieces') }}</div>
			</div>
            <div class="main__inner main__inner--short">
				<span class="main__text">
                    <input
                        type="file"
						name="excel"
                        ref="fileInput"
                        @change="handleFileUpload"
                        accept=".xlsx"
                        class="d-none"
                    >
                    <button class="btn btn-primary me-3" @click="uploadFile">
                        {{ $t('text.uploadExcel') }}
                    </button>
                </span>
				<div class="flex__column"></div>
			</div>
            <div class="main__inner main__inner--short">
				<span class="main__text">
                    <button class="btn btn-primary me-3" @click="downloadExcel">
                        {{ $t('text.downloadExcel') }}
                    </button>
                </span>
				<div class="flex__column"></div>
			</div>
            <div class="main__inner main__inner--short">
				<span class="main__text">
                    <button class="btn btn-primary me-3" @click="clearStat">
                        {{ $t('text.clearData') }}
                    </button>
                </span>
				<div class="flex__column"></div>
			</div>
            <div class="main__inner main__inner--short">
				<span class="main__text">
                    <button class="btn btn-warning me-3" @click="clearJobs">
                        {{ $t('text.clearJobs') }}
                    </button>
                </span>
				<div class="flex__column"></div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import yandexWordstatService from '../../../services/yandexWordstatService';
import redirect from '../../../utils/redirect';
import '../../../extensions/Array';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import toaster from '../../../utils/toaster';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const { canEdit, canView } = usePageInit('yandexwordstat');

const balance = ref<number>(0);
const tasksInWork = ref<number>(0);
const statisticsCollected = ref<number>(0);
const fileInput = ref<HTMLInputElement | null>(null);

const updateTasksCount = async () => {
	try {
		const response = await yandexWordstatService.getTasksInWork(localization, (errMsg, _, type) => toaster.error(toast, { [type as any]: [errMsg] }));
		tasksInWork.value = response.tasksInWork;
		statisticsCollected.value = response.totalPhrases;
	} catch (error) {
		toaster.error(toast, localization.t('text.errorLoadingTasksCount'));
	}
};

const updateBalance = async () => {
	try {
		const response = await yandexWordstatService.getBalance(localization, (errMsg, _, type) => toaster.error(toast, { [type as any]: [errMsg] }));
		balance.value = response.balance;
	} catch (error) {
		toaster.error(toast, localization.t('text.errorLoadingBalance'));
	}
};

const uploadFile = () => {
	fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (!target.files?.length) return;

	const formData = new FormData();
	formData.append('excel', target.files[0]);

	try {
		await yandexWordstatService.uploadExcel(localization, formData, (errMsg, _, type) => toaster.error(toast, { [type as any]: [errMsg] }));
		toaster.success(toast, localization.t('text.successUploadFile'));
		updateTasksCount();
	} catch (error) {
		toaster.error(toast, localization.t('text.errorUploadFile'));
	}
	target.value = '';
};

const downloadExcel = async () => {
	try {
		const baseUrl = import.meta.env.VITE_API_URL;
		const link = document.createElement('a');
		link.href = `${baseUrl}yandex-wordstat/downloadExcel`;
		link.setAttribute('download', 'wordstat-results.xlsx');
		
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		
		toaster.success(toast, localization.t('text.successDownloadFile'));
	} catch (error) {
		toaster.error(toast, localization.t('text.errorDownloadingFile'));
	}
};

const clearStat = async () => {
	try {
		await yandexWordstatService.clearStatistics(localization, (errMsg, _, type) => toaster.error(toast, { [type as any]: [errMsg] }));
		toaster.success(toast, localization.t('text.successClearData'));
		updateTasksCount();
	} catch (error) {
		toaster.error(toast, localization.t('text.errorClearData'));
	}
};

const clearJobs = async () => {
	try {
		await yandexWordstatService.clearJobs(localization, (errMsg, _, type) => toaster.error(toast, { [type as any]: [errMsg] }));
		toaster.success(toast, localization.t('text.successClearJobs'));
		updateTasksCount();
	} catch (error) {
		toaster.error(toast, localization.t('text.errorClearJobs'));
	}
};

// Добавляем watch для отслеживания tasksInWork
watch(tasksInWork, (newValue, oldValue) => {
    if (oldValue > 0 && newValue === 0) {
        updateBalance();
    }
});

onBeforeMount(async () => {
	await updateBalance();
	await updateTasksCount();
});

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
	setInterval(updateTasksCount, 10000); // 10 seconds
});
</script>


