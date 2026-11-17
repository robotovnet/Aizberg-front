<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit" v-if="canView">
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.selectExcel') }}</span>
				<input
					type="file"
					ref="fileInput"
					accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
					class="d-none"
					@change="onFileChange"
				/>
				<button class="btn btn-primary me-3" type="button" @click="openFilePicker">
					{{ $t('text.pickFile') }}
				</button>
				<span v-if="fileName" class="main__text">{{ fileName }}</span>
			</div>
			<div v-if="selectedFile" class="main__inner main__inner--short">
				<button
					class="btn btn-primary me-3"
					type="button"
					:disabled="loading"
					@click="downloadArchive">
					{{ $t('text.downloadArchive') }}
				</button>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import toaster from '../../../utils/toaster';
import productsService from '../../../services/productsService';

const toast = inject('toast') as any;
const localization: any = useI18n();
const { canEdit, canView } = usePageInit('catalog.products');

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const fileName = ref('');
const loading = ref(false);

const openFilePicker = () => {
	fileInput.value?.click();
};

const onFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];
	if (!file) {
		selectedFile.value = null;
		fileName.value = '';
		return;
	}
	selectedFile.value = file;
	fileName.value = file.name;
};

const downloadArchive = async () => {
	if (!selectedFile.value || loading.value) return;
	loading.value = true;
	const formData = new FormData();
	formData.append('excel', selectedFile.value);

	try {
		const result = await productsService.downloadPhotosArchiveByArticlesExcel(
			localization,
			formData,
			(errMsg, _, type) => toaster.error(toast, { [type as string]: [errMsg] }),
		);
		if (!result?.blob) {
			return;
		}
		const url = URL.createObjectURL(result.blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = result.filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toaster.success(toast, localization.t('text.successDownload'));
	} catch {
		toaster.error(toast, localization.t('text.errorDownload'));
	} finally {
		loading.value = false;
	}
};
</script>
