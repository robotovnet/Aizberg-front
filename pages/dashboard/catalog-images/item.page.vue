<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header_add')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__content">
			<div class="main__inner main__inner--short" v-if="!isEditMode && selectedFiles.length < 2">
				<span class="main__text">{{ $t('text.title_input') }}</span>
				<input
					type="text"
					v-model="title"
					class="main__input input"
					:placeholder="$t('text.title_input_placeholder')"
					@input="removeError(errors?.errors?.title)" />
				<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors?.title" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.category_input') }}</span>
				<input
					type="text"
					v-model="category"
					class="main__input input"
					:placeholder="$t('text.category_input_placeholder')"
					list="categories-list"
					@input="removeError(errors?.errors?.category)" />
				<datalist id="categories-list">
					<option :key="idx" :value="cat" v-for="(cat, idx) in categories"></option>
				</datalist>
				<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors?.category" />
			</div>
			
			<!-- Превью изображения при создании (только один файл) -->
			<div class="main__inner main__inner--short" v-if="!isEditMode && selectedFiles.length === 1 && imagePreview">
				<span class="main__text">{{ $t('text.image_preview') }}</span>
				<div style="margin-top: 10px;">
					<img :src="imagePreview" alt="Preview" style="max-width: 300px; max-height: 300px; object-fit: contain; border: 1px solid #ddd; padding: 5px;" />
				</div>
			</div>
			
			<!-- Отображение изображения при редактировании -->
			<div class="main__inner main__inner--short" v-if="isEditMode && imageData">
				<span class="main__text">{{ $t('text.image') }}</span>
				<div style="margin-top: 10px;">
					<img :src="imageData.micro_url" alt="Image" style="max-width: 300px; max-height: 300px; object-fit: contain; border: 1px solid #ddd; padding: 5px;" />
				</div>
			</div>
			
			<!-- URL оригинального изображения (только при редактировании) -->
			<div class="main__inner main__inner--short" v-if="isEditMode && imageData">
				<span class="main__text">{{ $t('text.original_url') }}</span>
				<div style="display: flex; align-items: center; gap: 10px;">
					<a
						:href="imageData.original_url"
						target="_blank"
						style="color: #428AB4; text-decoration: underline; flex: 1; word-break: break-all;">
						{{ imageData.original_url }}
					</a>
					<button
						@click="copyToClipboard(imageData.original_url)"
						style="background: none; border: none; cursor: pointer; padding: 5px;"
						:title="$t('text.copy_original_url')">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
						</svg>
					</button>
				</div>
			</div>
			
			<!-- URL уменьшенной копии (только при редактировании) -->
			<div class="main__inner main__inner--short" v-if="isEditMode && imageData">
				<span class="main__text">{{ $t('text.micro_url') }}</span>
				<div style="display: flex; align-items: center; gap: 10px;">
					<a
						:href="imageData.micro_url"
						target="_blank"
						style="color: #428AB4; text-decoration: underline; flex: 1; word-break: break-all;">
						{{ imageData.micro_url }}
					</a>
					<button
						@click="copyToClipboard(imageData.micro_url)"
						style="background: none; border: none; cursor: pointer; padding: 5px;"
						:title="$t('text.copy_micro_url')">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
						</svg>
					</button>
				</div>
			</div>
			
			<!-- Выбор файла (только при создании) -->
			<div class="main__inner main__inner--short" v-if="!isEditMode">
				<span class="main__text">{{ $t('text.select_image') }}</span>
				<input
					type="file"
					ref="fileInput"
					multiple
					@change="handleFileSelect"
					accept="image/*"
					style="display: none;" />
				<button class="btn" @click="triggerFileInput">{{ $t('text.select_image') }}</button>
				<p v-if="selectedFiles.length >= 2" class="main__text" style="margin-top: 8px;">
					{{ $t('text.files_selected_count', { count: selectedFiles.length }) }}
				</p>
				<p
					v-else
					class="main__text"
					style="margin-top: 6px; opacity: 0.85; font-size: 0.95em;">
					{{ $t('text.select_multiple_hint') }}
				</p>
				<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors?.image" />
				<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors?.images" />
			</div>
			
			<div class="main__inner main__inner--end">
				<button
					v-if="isEditMode"
					class="btn"
					style="display: inline-flex; align-items: center; justify-content: center; gap: 6px;"
					@click="() => onConfirmDelete(itemId, imageData?.title || '')">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="3 6 5 6 21 6"></polyline>
						<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
						<line x1="10" y1="11" x2="10" y2="17"></line>
						<line x1="14" y1="11" x2="14" y2="17"></line>
					</svg>
					{{ $t('text.delete_image') }}
				</button>
				<button v-if="isEditMode" class="btn" style="margin-left: 10px;" @click="saveOrUpdate('update')">
					{{ $t('text.update') }}
				</button>
				<button v-else class="btn" @click="saveOrUpdate('save')">
					{{ $t('text.save') }}
				</button>
			</div>
		</div>
		
		<AskDialog
			:deleteId="deleteItemId?.toString()"
			:title="$t('text.dialog_delete_title')"
			:question="$t('text.dialog_delete_question')"
			:onConfirm="onDelete" />
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import imageUploaderService from '../../../services/imageUploaderService';
import AskDialog from '../../_components/AskDialog.vue';
import redirect from '../../../utils/redirect';
import sleep from '../../../utils/sleep';

const store = useStore<MainState>();
const toast = inject('toast') as any;
const localization: any = useI18n();

const { canEdit, canView, itemId, isEditMode } = usePageInit('imageuploader');
const { validate, errors, removeError } = useValidationHandler();

const deleteItemId = ref<string | undefined>();
const itemName = ref<string>('');

const onConfirmDelete = async (id: string | number, name: string) => {
	itemName.value = name;
	deleteItemId.value = undefined;
	await sleep(1);
	deleteItemId.value = id?.toString();
};

const onDelete = async (id: string) => {
	store.commit('setLoading', true);
	const response: any = await imageUploaderService.remove(
		localization,
		id,
		errMsg => toaster.error(toast, errMsg),
	);
	if (response.status === 'ok' || response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessDeleted'));
		redirect('/dashboard/catalog-images');
	}
	store.commit('setLoading', false);
};

const title = ref('');
const category = ref('');
const selectedFiles = ref<File[]>([]);
const imagePreview = ref<string | null>(null);
const imageData = ref<any>(null);
const categories = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const errorNames = ['title', 'image', 'images', 'category'];

const copyToClipboard = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text);
		toaster.success(toast, localization.t('text.copy_success'));
	} catch (err) {
		toaster.error(toast, 'Ошибка при копировании');
	}
};

const triggerFileInput = () => {
	fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const files = Array.from(target.files || []);
	const imageFiles = files.filter(f => f.type.startsWith('image/'));
	if (files.length && files.length !== imageFiles.length) {
		toaster.error(toast, 'Выберите файл изображения');
	}
	selectedFiles.value = imageFiles;
	removeError(errors.value?.errors?.image);
	removeError(errors.value?.errors?.images);
	if (imageFiles.length === 1) {
		title.value = imageFiles[0].name.replace(/\.[^/.]+$/, '');
		removeError(errors.value?.errors?.title);
		const reader = new FileReader();
		reader.onload = (e) => {
			imagePreview.value = e.target?.result as string;
		};
		reader.readAsDataURL(imageFiles[0]);
	} else {
		imagePreview.value = null;
	}
};

const sendData = computed(() => {
	if (isEditMode.value) {
		return {
			title: title.value,
			category: category.value || undefined,
		};
	}
	const formData = new FormData();
	if (selectedFiles.value.length >= 2) {
		if (category.value) {
			formData.append('category', category.value);
		}
		selectedFiles.value.forEach(file => {
			formData.append('images[]', file);
		});
	} else if (selectedFiles.value.length === 1) {
		formData.append('title', title.value);
		if (category.value) {
			formData.append('category', category.value);
		}
		formData.append('image', selectedFiles.value[0]);
	} else {
		formData.append('title', title.value);
		if (category.value) {
			formData.append('category', category.value);
		}
	}
	return formData;
});

const toValidate = computed(() => ({
	title: title.value,
	image: selectedFiles.value[0] ?? null,
	category: category.value,
}));

const loadImage = async () => {
	store.commit('setLoading', true);
	try {
		const response = await imageUploaderService.get(
			localization,
			itemId.value,
			errMsg => toaster.error(toast, errMsg),
		);
		imageData.value = response.data;
		title.value = response.data.title;
		category.value = response.data.category || '';
	} catch (error) {
		console.error('Error loading image:', error);
	} finally {
		store.commit('setLoading', false);
	}
};

const loadCategories = async () => {
	try {
		const response = await imageUploaderService.getCategories(
			localization,
			errMsg => toaster.error(toast, errMsg),
		);
		categories.value = response.data || [];
	} catch (error) {
		console.error('Error loading categories:', error);
	}
};

const saveOrUpdate = async (selector: string) => {
	let isClicked = true;
	if (selector === 'save' && !isEditMode.value) {
		if (selectedFiles.value.length >= 2) {
			for (const f of selectedFiles.value) {
				if (!f.type.startsWith('image/')) {
					toaster.error(toast, 'Выберите файл изображения');
					return;
				}
			}
			errors.value = [];
		} else if (!validate(isClicked, toValidate.value)) {
			return;
		}
	} else if (!validate(isClicked, toValidate.value)) {
		return;
	}
	store.commit('setLoading', true);
	try {
		if (selector === 'save') {
			const response: any = await imageUploaderService.create(
				localization,
				sendData.value as FormData,
				errorNames,
				errMsg => toaster.error(toast, errMsg),
			);
			if (response.data) {
				const msg =
					Array.isArray(response.data)
						? localization.t('text.generalSuccessCreatedMultiple')
						: localization.t('text.generalSuccessCreated');
				toaster.success(toast, msg);
				redirect('/dashboard/catalog-images');
			}
		} else {
			const response: any = await imageUploaderService.update(
				localization,
				itemId.value,
				sendData.value,
				errorNames,
				errMsg => toaster.error(toast, errMsg),
			);
			if (response.data) {
				toaster.success(toast, localization.t('text.generalSuccessUpdated'));
				await loadImage();
			}
		}
	} catch (error) {
		console.error('Error saving/updating:', error);
	} finally {
		store.commit('setLoading', false);
	}
};


onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/catalog-images');
	await sleep(1);
	store.commit('setLoading', true);
	await loadCategories();
	if (isEditMode.value) {
		await loadImage();
	}
	store.commit('setLoading', false);
});
</script>
