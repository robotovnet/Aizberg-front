<template>
	<AppPage
		:title="$t('text.header')"
		:canEdit="canEdit"
		:handler="() => redirect('/dashboard/catalog-images/item')"
		:button-text="$t('text.add_button')"
		v-if="canView">
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.category') }}</span>
				<select class="main__select select" @change="onCategoryChange" v-model="selectedCategory">
					<option value="">{{ $t('text.all_categories') }}</option>
					<option :key="idx" :value="category" v-for="(category, idx) in categories">{{ category }}</option>
				</select>
			</div>
		</div>
		<div class="list list--six">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.image') }}</span>
				<span class="list__heading">{{ $t('text.name') }}</span>
				<span class="list__heading">{{ $t('text.category') }}</span>
				<span class="list__heading">{{ $t('text.copy_original_url') }}</span>
				<span class="list__heading">{{ $t('text.copy_micro_url') }}</span>
				<span class="list__heading">{{ $t('text.edit') }}</span>
			</div>
			<div :key="image.id" class="list__item" v-for="image in images">
				<div class="list__elem">
					<img
						:src="image.micro_url"
						:alt="image.title"
						@click="openImage(image.original_url)"
						style="cursor: pointer; max-width: 100px; max-height: 100px; object-fit: contain;"
						:title="$t('text.open_image')" />
				</div>
				<div class="list__elem">{{ image.title }}</div>
				<div class="list__elem">
					<a
						href="#"
						@click.prevent="filterByCategory(image.category)"
						style="color: #428AB4; text-decoration: underline; cursor: pointer;">
						{{ image.category || '-' }}
					</a>
				</div>
				<div class="list__elem">
					<button
						class="list__edit"
						@click="copyToClipboard(image.original_url)"
						:title="$t('text.copy_original_url')"
						style="background: none; border: none; cursor: pointer;">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
						</svg>
					</button>
				</div>
				<div class="list__elem">
					<button
						class="list__edit"
						@click="copyToClipboard(image.micro_url)"
						:title="$t('text.copy_micro_url')"
						style="background: none; border: none; cursor: pointer;">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
						</svg>
					</button>
				</div>
				<div class="list__elem">
					<button
						:disabled="!canEdit"
						class="list__edit"
						@click="redirect(`/dashboard/catalog-images/item?edit=${image.id}`)"
						:title="$t('text.edit')"></button>
				</div>
			</div>
		</div>
		<div class="main__bottom">
			<div class="main__inner">
				<p class="main__text">{{ $t('text.total') }}: {{ totalAmount ? totalAmount : '0' }}</p>
				<div class="pagination" v-if="totalAmount > itemsOnPage">
					<app-pagination
						v-model="page"
						:page-count="pageCount"
						:margin-pages="2"
						:page-range="3"
						@input="currentPageHandler"
						:container-class="'pagination__list'"
						:page-class="'pagination__item'"
						:active-link-class="'active'"
						:page-link-class="'pagination__link'"
						:break-view-class="''"
						:break-view-link-class="''"
						:first-last-button="false"
						:nextLinkClass="'next-class'"
						:hide-prev-next="true" />
				</div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, computed, onBeforeMount, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import imageUploaderService from '../../../services/imageUploaderService';
import AppPagination from '../../_components/AppPagination.vue';
import redirect from '../../../utils/redirect';
import sleep from '../../../utils/sleep';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const { canEdit, canView } = usePageInit('imageuploader');

const images = ref<any[]>([]);
const categories = ref<string[]>([]);
const selectedCategory = ref<string>('');
const page = ref(1);
const itemsOnPage = ref(20);
const totalAmount = ref(0);
const pageCount = computed(() => Math.ceil(totalAmount.value / itemsOnPage.value));

const baseUrl = import.meta.env.VITE_API_URL;

const openImage = (url: string) => {
	window.open(url, '_blank');
};

const copyToClipboard = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text);
		toaster.success(toast, localization.t('text.copy_success'));
	} catch (err) {
		toaster.error(toast, 'Ошибка при копировании');
	}
};

const filterByCategory = (category: string) => {
	selectedCategory.value = category;
	page.value = 1;
	// Обновляем URL
	const url = new URL(window.location.href);
	if (category) {
		url.searchParams.set('category', category);
	} else {
		url.searchParams.delete('category');
	}
	window.history.pushState({}, '', url.toString());
	loadImages();
};

const onCategoryChange = () => {
	page.value = 1;
	// Обновляем URL
	const url = new URL(window.location.href);
	if (selectedCategory.value) {
		url.searchParams.set('category', selectedCategory.value);
	} else {
		url.searchParams.delete('category');
	}
	window.history.pushState({}, '', url.toString());
	loadImages();
};

const currentPageHandler = async (currentPage: number) => {
	page.value = currentPage;
	// Обновляем URL
	const url = new URL(window.location.href);
	url.searchParams.set('page', currentPage.toString());
	window.history.pushState({}, '', url.toString());
	await loadImages();
};

const loadImages = async () => {
	store.commit('setLoading', true);
	try {
		const response = await imageUploaderService.getAll(
			localization,
			page.value,
			selectedCategory.value,
			errMsg => toaster.error(toast, errMsg),
		);
		images.value = response.data || [];
		totalAmount.value = response.meta?.total || 0;
		itemsOnPage.value = response.meta?.per_page || 20;
	} catch (error) {
		console.error('Error loading images:', error);
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

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	
	// Загружаем параметры из URL
	const urlParams = new URLSearchParams(window.location.search);
	const categoryParam = urlParams.get('category');
	const pageParam = urlParams.get('page');
	
	if (categoryParam) {
		selectedCategory.value = categoryParam;
	}
	if (pageParam) {
		const pageNum = parseInt(pageParam, 10);
		if (!isNaN(pageNum) && pageNum > 0) {
			page.value = pageNum;
		}
	}
	
	await Promise.all([
		loadCategories(),
		loadImages(),
	]);
	store.commit('setLoading', false);
});
</script>

<style lang="scss" scoped>
.list--six .list__elem:first-child,
.list--six .list__heading:first-child {
	max-width: 120px;
}

.list--six .list__elem:nth-child(2),
.list--six .list__heading:nth-child(2) {
	max-width: 250px;
}

.list--six .list__elem:nth-child(3),
.list--six .list__heading:nth-child(3) {
	max-width: 200px;
}

.list--six .list__elem:nth-child(4),
.list--six .list__heading:nth-child(4) {
	max-width: 80px;
	text-align: center;
}

.list--six .list__elem:nth-child(5),
.list--six .list__heading:nth-child(5) {
	max-width: 80px;
	text-align: center;
}

.list--six .list__elem:nth-child(6),
.list--six .list__heading:nth-child(6) {
	max-width: 80px;
	text-align: center;
}

.list--six .list__heading:nth-child(5n),
.list--six .list__elem:nth-child(5n) {
	margin-left: 40px;
}
</style>

