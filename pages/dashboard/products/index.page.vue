<template>
	<AppPage
		:title="$t('text.header')"
		:canEdit="canEdit"
		:handler="() => redirect('/dashboard/products/item')"
		:button-text="$t('text.add_button')"
		v-if="canView">
		<div class="list list--four list--goods">
			<div class="list__topping" style="height:40px;">
				<span class="list__heading">{{ $t('text.photo') }}</span>
				<span class="list__heading">{{ $t('text.name') }}</span>
				<span class="list__heading">{{ $t('text.display') }}</span>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			
			<div class="main__content">
				<select class="main__select select" @change="currentPageHandler" v-model="currentSectionId">
					<option value="0" selected>{{ $t('text.choose_subsection') }}</option>
					<option :key="section.id" :value="section.id" v-for="section in catalogSections">{{ section.name }}</option>
				</select>
				<button class="main__btn modal-btn" @click="() => (isModalVisible = true)">{{ $t('text.filters') }}</button>
			</div>
			<div class="main__content" v-if="excelDownload">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M21.17 3.25q.33 0 .59.25q.24.24.24.58v15.84q0 .34-.24.58q-.26.25-.59.25H7.83q-.33 0-.59-.25q-.24-.24-.24-.58V17H2.83q-.33 0-.59-.24Q2 16.5 2 16.17V7.83q0-.33.24-.59Q2.5 7 2.83 7H7V4.08q0-.34.24-.58q.26-.25.59-.25M7 13.06l1.18 2.22h1.79L8 12.06l1.93-3.17H8.22L7.13 10.9l-.04.06l-.03.07q-.26-.53-.56-1.07q-.25-.53-.53-1.07H4.16l1.89 3.19L4 15.28h1.78m8.1 4.22V17H8.25v2.5m5.63-3.75v-3.12H12v3.12m1.88-4.37V8.25H12v3.13M13.88 7V4.5H8.25V7m12.5 12.5V17h-5.62v2.5m5.62-3.75v-3.12h-5.62v3.12m5.62-4.37V8.25h-5.62v3.13M20.75 7V4.5h-5.62V7Z"/></svg> <a :href="getExcelDownloadUrl('excel')">Скачать данные товаров в Excel</a><br>
				<template v-if="show1cPriceDownloadLink">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512"><path fill="currentColor" d="M116.364 116.364v279.272H46.545V209.455H0v-69.819h46.545v-23.272zm228.072 116.363h72.146c-11.637-65.163-67.491-116.363-137.31-116.363c-76.8 0-139.636 62.836-139.636 139.636c0 75.242 60.315 137.158 134.982 139.636H512v-69.818H279.273C213 324.333 190.947 251.405 226.2 210.175c34.884-40.507 100.83-27.666 118.417 23.057"/></svg> <a :href="getExcelDownloadUrl('1c')">Скачать прайс лист для загрузки в 1С</a><br>
				</template>
				<br>

				<input type="checkbox" id="in-stock" v-model="inStock" style="vertical-align: text-top; margin-right: 4px;">
				<label for="in-stock"> Только товары в наличии</label><br>

				<input type="checkbox" id="similar-products" v-model="similarProducts" style="vertical-align: text-top; margin-right: 4px;">
				<label for="similar-products"> Выводить аналоги</label>
			</div>
			
			<div :key="idx" class="list__item" v-for="(product, idx) in products">
				<div class="list__elem">
					<img v-if="product.photos[0]?.file_path" :src="getImageUrl(product.photos[0]?.file_path)" alt="" />
					<div v-else class="no-foto">
						нет<br />
						фото
					</div>
				</div>
				<div class="list__elem">
					<div class="main__product">
						<span>
						<a target='_blank' :href="removeSubdomain(product.url)" :title="$t('text.open_in_site')" style='margin-right: 5px;'>
							<svg width="11" height="10"><g clip-path="url(#a)" stroke="#428AB4"><path stroke-width="2" d="M6 1h-8m3-1v8M0 9h8m0 1V5m-4.507.138 6.794-4"/><path d="M8 .5h3m-3 0h3m-3 0h3m-.5-.5v3"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h11v10H0z"/></clipPath></defs></svg>
						</a>
						<a
							:href="`/dashboard/products/item?edit=${product.id}`"
							@click.prevent="() => redirect(`/dashboard/products/item?edit=${product.id}`)"
							class="main__product-name"
							>{{ htmlDecode(product.name) }}</a
						>
						</span>
						<span class="main__product-code">{{ product.sections[0]?.breadcrumbs }}</span>
						<span class="main__product-code">
							{{ $t('text.vendor_code') }}: {{ product.vendor_code }}
							<a
								:href="`/dashboard/products/item?based_on_pid=${product.id}`"
								@click.prevent="() => redirect(`/dashboard/products/item?based_on_pid=${product.id}`)"
								:title="$t('text.create_based_on') || 'Создать товар на основе этого'"
								class="create-based-link"
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M16 1H4C2.9 1 2 1.9 2 3V19H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="#428AB4"/>
								</svg>
							</a>
						</span>
					</div>
				</div>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						@click="changeVisibility(product.id)"
						class="dot"
						:class="{ 'dot--red': product.is_hidden === 'Y', 'dot--green': product.is_hidden === 'N' }"
						:title="product.is_hidden === 'Y' ? $t('text.turn_on') : $t('text.turn_off')"></button>
				</span>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="cross"
						@click="onConfirmDelete(product?.id, product?.name)"
						:title="$t('text.remove')"></button>
				</span>
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
		<product-filter-modal
			:is-visible="isModalVisible"
			:product-types="productTypes"
			:brands="brands"
			@sort="sortBy"
			@quantity="setQuantity"
			@close="() => (isModalVisible = false)" />

		<AskDialog
			:deleteId="itemId?.toString()"
			:title="$t('text.dialog_delete_title')"
			:question="`${$t('text.dialog_delete_question')} ${itemName} ?`"
			:onConfirm="onDelete" />
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import AskDialog from '../../_components/AskDialog.vue';
import productsService from '../../../services/productsService';
import ProductFilterModal from '../../_components/dashboard/products/ProductFilterModal.vue';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import AppPagination from '../../_components/AppPagination.vue';
import catalogSectionsService from '../../../services/catalogSectionsService';
import sleep from '../../../utils/sleep';
import productTypesService from '../../../services/productTypesService';
import brandsService from '../../../services/brandsService';
import { DEFAULT_PIC, MATRIX_SECTIONS } from '../../../utils/constants';
import { sync } from 'fast-glob';
import feature from '../../../localization/feature';
import redirect from '../../../utils/redirect';
import { removeSubdomain } from '../../../utils/constants';
const baseUrl = import.meta.env.VITE_API_URL;
const defaultImg = ref(DEFAULT_PIC);
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const { canEdit, canView } = usePageInit('catalog.products');

const products = ref();
const isModalVisible = ref(false);
const page = ref(1);
const itemsOnPage = ref(10);
const productTypes = ref();
const brands = ref();
const excelDownload = ref(false);
const currentSectionId = ref('0');
const pageCount = computed(() => Math.ceil(totalAmount.value / itemsOnPage.value));
const totalAmount = ref();
const catalogSections = ref();

const show1cPriceDownloadLink = computed(() => {
	if (currentSectionId.value === '0' || currentSectionId.value === 0) return false;
	const section = catalogSections.value?.find((s: { id: number | string; name: string }) => String(s.id) === String(currentSectionId.value));
	return Boolean(section && MATRIX_SECTIONS.includes(section.name));
});
const queryString = ref('');
const filtersString = ref('');
const inStock = ref(false);
const similarProducts = ref(false);

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		productsService.getAllWithPagination(
			localization,
			page.value,
			itemsOnPage.value,
			currentSectionId.value,
			queryString.value,
			errMsg => toaster.error(toast, errMsg),
		),
		productsService.total(localization, currentSectionId.value, filtersString.value, errMsg => toaster.error(toast, errMsg)),
		catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg), '?model=product&orderField=name'),
		productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		brandsService.getAllWithoutHidden(localization, errMsg => toaster.error(toast, errMsg)),
	])
		.then(values => {
			let url = new URL(window.location.href.toString());
			
			if(url.searchParams.has("s")) {
				let searchString = url.searchParams.get("s");
				store.dispatch('searchProducts', encodeURIComponent(searchString));
			} else {
				products.value = values[0];
				const total: any = values[1];
				catalogSections.value = values[2];
				productTypes.value = values[3];
				brands.value = values[4];
				totalAmount.value = total.total_products;
				itemsOnPage.value = total.per_page;
				console.log(total);
			}
		})
		.then(() => store.commit('setLoading', false));
});

const currentPageHandler = async currentPage => {
	//await sleep(1);
	store.commit('setLoading', true);

	console.log('queryString = ' + queryString.value);
	console.log('filtersString = ' + filtersString.value);
	
	products.value = await productsService.getAllWithPagination(
		localization,
		currentPage,
		itemsOnPage.value,
		currentSectionId.value,
		queryString.value,
		errMsg => toaster.error(toast, errMsg),
	);

	 excelDownload.value = (currentSectionId.value != 0) ? true : false;
	
	const total: any = await productsService.total(localization, currentSectionId.value, filtersString.value + `&onPage=${itemsOnPage.value}`, errMsg =>
		toaster.error(toast, errMsg),
	);

	page.value = currentPage;
	totalAmount.value = total.total_products;
	store.commit('setLoading', false);
};
const product = ref();
const sendData: any = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: product.value.name,
		},
	],
	overview_texts: [
		{
			lang: localization.locale.value,
			value: product.value.overview_text,
		},
	],
	vendor_code: product.value.vendor_code,
	brand_id: product.value.brand_id,
	product_group_id: product.value.product_group_id,
	catalog_section_id: product.value.sections.map(section => section.id) || null,
	is_hidden: product.value.is_hidden === 'Y' ? 'N' : 'Y',
	stock_status: product.value.stock_status,
	uuid: product.value.uuid,
	related_products: product.value.related_products,
	similar_products: product.value.similar_products,
	prices: product.value.prices,
	features: product.value.features.map(feature => ({ feature_id: feature?.pivot.feature_id, value: feature?.pivot.value })) || null,
	copy_data_to_similar_products: product.value.copy_data_to_similar_products,
}));

const changeVisibility = async id => {
	
	store.commit('setLoading', true);
	await productsService.toggleVisibilityOfProduct(localization, id, errMsg => toaster.error(toast, errMsg));
	
	console.log(page);
	await currentPageHandler(page.value);
	
	store.commit('setLoading', false);
};

const sortBy = async (qString, fString) => {
	queryString.value = qString;
	console.log('fString = ' + fString);
	filtersString.value = fString;
	await currentPageHandler(page.value);
};
const setQuantity = quantity => {
	itemsOnPage.value = quantity;
};
const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(productsService);
watch(
	() => marker.value,
	async () => currentPageHandler(page.value),
);

watch(
	() => store.state.productSearch,
	() => {
		products.value = store.state.productSearch
	}
);

watch(
	() => store.state.productSearchTotal,
	() => {
		totalAmount.value = store.state.productSearchTotal.total_products
	}
);

	
watch(
	() => store.state.searchQuery,
	() => {
		queryString.value = '&search=' + store.state.searchQuery;
		filtersString.value = '&search=' + store.state.searchQuery;
	}
);
	

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
const htmlDecode = function (input) {
	var doc = new DOMParser().parseFromString(input, 'text/html');
	return doc.documentElement.textContent;
};

const getExcelDownloadUrl = (type = 'excel') => {
	let baseExcelUrl = type === 'excel' 
		? `${import.meta.env.VITE_API_URL}catalog/products/excel/${currentSectionId.value}`
		: `${import.meta.env.VITE_API_URL}catalog/products/1c/${currentSectionId.value}`;
	
	const params = [];
	
	if (inStock.value) {
		params.push('in_stock=1');
	}
	
	if (similarProducts.value) {
		params.push('similar_products=1');
	}
	
	if (params.length > 0) {
		baseExcelUrl += '?' + params.join('&');
	}
	
	return baseExcelUrl;
};

const getImageUrl = (filePath) => {
	if (!filePath) return '';
	return baseUrl + filePath.replace('/origin/', '/micro/');
};
</script>
<style lang="scss" scoped>
.main__product-name::before {
    display: none !important;
}
	
.no-foto {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 76px;
	height: 76px;
	overflow: hidden;
	text-align: center;
	background: #c4c4c4;
}

.create-based-link {
	margin-left: 5px;
	display: inline-block;
	vertical-align: middle;
	opacity: 0.7;
	transition: opacity 0.2s;
	
	&:hover {
		opacity: 1;
	}
	
	svg {
		vertical-align: baseline;
	}
}
</style>
