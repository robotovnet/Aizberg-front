<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="tabs">
			<ul class="tabs__list" role="tablist">
				<li class="tabs__item" :class="{ 'tabs__item--active': activeTab === 'main' }">
					<button class="tabs__button" @click="setActiveTab('main')">
						{{ $t('text.main') }}
					</button>
				</li>
				<li class="tabs__item" v-if="currentParameters" :class="{ 'tabs__item--active': activeTab === 'param' }">
					<button class="tabs__button" @click="setActiveTab('param')">
						{{ $t('text.parameters') }}
					</button>
				</li>
				<li class="tabs__item" :class="{ 'tabs__item--active': activeTab === 'links' }">
					<button class="tabs__button" @click="setActiveTab('links')">
						{{ $t('text.tab_links') }}
					</button>
				</li>
				<li class="tabs__item" :class="{ 'tabs__item--active': activeTab === 'ads' }">
					<button class="tabs__button" @click="setActiveTab('ads')">
						{{ $t('text.advertisement') }}
					</button>
				</li>
			</ul>
			<!--MAIN TAB 1-->
			<div
				class="tabs__content product-page-main-tab"
				:class="{ 'tabs__content--active': activeTab === 'main' }"
				v-if="activeTab === 'main'">
				<div class="main__content">
					<div class="main__inner main__inner--short">
						<span class="main__text"> {{ $t('text.title_input') }}</span>
						<input
							v-model="title"
							type="text"
							class="main__input input"
							:placeholder="$t('text.title_input_placeholder')"
							@input="removeError(errors?.errors['names.0.value'])" />
						<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['names.0.value']" />
						<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['names']" />
					</div>
					<div class="main__inner main__inner--short">
						<span class="main__text"> {{ $t('text.vendor_code') }}</span>
						<input
							type="text"
							v-model="vendorCode"
							class="main__input input"
							:placeholder="$t('text.vendor_code_placeholder')"
							@input="removeError(errors?.errors['vendor_code'])" />
						<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['vendor_code']" />
					</div>
					<div class="main__inner main__inner--short">
						<span class="main__text"> {{ $t('text.brand') }}</span>
						<select class="main__select select" @input="removeError(errors?.errors['brand_id'])" v-model="brandId">
							<option value="0" selected disabled>{{ $t('text.choose_brand') }}</option>
							<option :key="idx" :value="brand.id" v-for="(brand, idx) in brands">
								{{ brand.name }}
							</option>
						</select>
						<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['brand_id']" />
					</div>

					<!-- Product type -->
					<div class="main__inner main__inner--short">
						<span class="main__text">{{ $t('text.product_type') }}</span>
						<select
							class="main__select select"
							v-model="productType"
							@input="removeError(errors?.errors['product_group_id'])"
							@change="productFeaturesInit">
							<option value="0" selected disabled>{{ $t('text.select_type') }}</option>
							<option :key="idx" :value="pType" v-for="(pType, idx) in productTypes">
								{{ pType?.plural_name }}
							</option>
						</select>
						<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['product_group_id']" />
					</div>

					<!-- Подраздел (Категория) -->
					<div class="main__inner main__inner--short">
						<span class="main__text">{{ $t('text.subsection') }}</span>
						<select class="main__select select" @change="catalogSectionInit" v-model="catalogSection">
							<option value="0" selected disabled>
								{{ $t('text.select_subsection') }}
							</option>
							<option :key="idx" :value="cSection.id" v-for="(cSection, idx) in catalogSections">
								{{ cSection.name }}
							</option>
						</select>
						<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['catalog_section_id']" />
					</div>

					<!-- Добавляем выбор типа матрицы -->
					<div class="main__inner main__inner--short" v-if="showMatrixTypeSelect">
						<span class="main__text">{{ $t('text.matrix_type') }}</span>
						<select class="main__select select" v-model="matrixTypeId">
							<option value="0" selected disabled>{{ $t('text.select_matrix_type') }}</option>
							<option :key="idx" :value="mType.id" v-for="(mType, idx) in matrixTypes">
								{{ mType.name }}
							</option>
						</select>
					</div>

					<!-- Дата добавления -->
					<div class="main__inner main__inner--short" v-if="isEditMode">
						<span class="main__text">{{ $t('text.created_at') }}</span>
						<input
							type="datetime-local"
							step="1"
							v-model="createdAt"
							class="main__input input"
							@input="removeError(errors?.errors['created_at'])" />
					</div>

					<!-- Overview text  -->
					<div class="main__inner main__inner--short main__inner--top">
						<span class="main__text">{{ $t('text.description') }}</span>
						<textarea
							id='editor'
							class="main__textarea textarea"
							v-model="overviewText"
							@input="removeError(errors?.errors['overview_texts'])"
							:placeholder="$t('text.description_placeholder')"></textarea>
						<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['overview_texts']" />
						<span
							v-if="errors?.errors"
							class="main__error main__error-message"
							v-html="errors?.errors['overview_texts.0.value']" />
					</div>

					<!-- Where SN text  -->
					<div class="main__inner main__inner--short main__inner--top">
						<span class="main__text">{{ $t('text.where_sn') }}</span>
						<textarea
							class="main__textarea textarea"
							v-model="whereSnText"
							@input="removeError(errors?.errors['where_sn'])"
							:placeholder="$t('text.where_sn_placeholder')"
							style="min-height: 75px;"></textarea>
						<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['where_sn']" />
					</div>

					<div class="main__inner main__inner--end">
						<span>{{ $t('text.product_availability') }}:</span>
					</div>
					<div class="main__inner main__inner--end">
						<label :key="idx" for="status-product-checkbox1" class="checkbox-group" v-for="(p, idx) in stockStatusOptions">
							<input
								type="radio"
								:value="p"
								id="status-product-checkbox1"
								name="status-product"
								class="checkbox-group__checkbox"
								v-model="stockStatus" />
							<span>{{ p.name }}</span>
						</label>
					</div>
					<div class="main__inner main__inner--end">
						<label for="type-checkbox" class="checkbox-group">
							<span>{{ $t('text.hide_product') }}</span>
							<input type="checkbox" class="checkbox-group__checkbox" v-model="isHidden" />
						</label>
					</div>
					<div class="main__inner main__inner--end">
						<label for="type-checkbox" class="checkbox-group">
							<span>{{ $t('text.not_for_everyone') }}</span>
							<input type="checkbox" class="checkbox-group__checkbox" v-model="notForEveryone" />
						</label>
					</div>
					<div class="main__inner main__inner--end">
						<label for="type-checkbox" class="checkbox-group">
							<span>{{ $t('text.ads_rotator_product') }}</span>
							<input type="checkbox" class="checkbox-group__checkbox" v-model="adsRotator" />
						</label>
					</div>
					<!--IMAGE SECTION-->
					<div class="main__inner main__inner--short main__inner--top">
						<span class="main__text"></span>
						<div
							class="main__textarea textarea d-flex justify-content-end upload-file__list mb-10 wrap p-0"
							v-if="fetchedProductPhotos.length">
							<div
								:key="photo.id"
								@dragenter.prevent
								@dragover.prevent
								@drop="onDrop($event, photo)"
								v-for="photo in fetchedProductPhotos">
								<div
									@dragstart="onDragStart($event, photo)"
									draggable="true"
									@drag="onDrag($event)"
									class="upload-file__item">
									<div class="upload-file__img">
										<img :src="baseUrl + photo.path" alt="Photo" />
									</div>
									<div class="d-flex justify-content-center">
										<div>
											<a href="#" @click.prevent="removeFetchedPhoto(photo.id)" class="upload-file__link">{{
												$t('text.remove')
											}}</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="main__inner main__inner--short main__inner--start">
						<span class="main__text">
						{{ $t('text.photo') }}
						<span v-if="fetchedProductPhotos.length">
							<a :href="`${baseUrl}catalog/products/photos/download/${product.id}`" :title="$t('text.download_photo')" download>
								<span style="font-size: 14px; margin-left: 2px; display: inline-block;">📥</span>
							</a>
						</span>
						</span>
						<app-image-loader v-model="productPhotos" :loading="imageLoading"></app-image-loader>
					</div>
					<div class="main__inner main__inner--short">
						<span class="main__text">{{ $t('text.price') }}</span>
						<div class="main__block main__block--column">
							<template v-for="(priceType, idx) in currentPriceTypes" :key="priceType.price_type_id">
								<div class="main__product">
									<input type="text" class="main__input input" style="width: 25%" :placeholder="priceType.name" v-model="priceType.value" />
									{{ priceType.name }} 
									<br>
								</div>
								<div style="font-size: 12px; font-weight: 400; color: #f11046;"
									v-if="errors?.errors"
									class="main__product"
									v-html="errors?.errors[`prices.${idx}.value`]" />
							</template>
						</div>
					</div>
					<div class="main__inner main__inner--short">
						<!-- Сопутствующие товары  -->
						<span class="main__text">{{ $t('text.related_products') }}</span>
						<div class="main__block main__block--column" v-if="relatedProducts">
							<div :key="idx" class="main__product" v-for="(product, idx) in relatedProducts">
								<div class="main__product-group">
									<span>
									<a
										target='_blank' 
										:href="removeSubdomain(product.url)" 
										:title="$t('text.open_on_site')" style='margin-right: 5px;'>
										<svg width="11" height="10"><g clip-path="url(#a)" stroke="#428AB4"><path stroke-width="2" d="M6 1h-8m3-1v8M0 9h8m0 1V5m-4.507.138 6.794-4"/><path d="M8 .5h3m-3 0h3m-3 0h3m-.5-.5v3"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h11v10H0z"/></clipPath></defs></svg>
									</a>
									<a
										target='_blank'
										:href="`/dashboard/products/item?edit=${product.related_product_id}`"
										:title="$t('text.open_on_dashboard')"
										class="main__product-name"
										v-html="`${product.name}`"></a>
									</span>
									<span class="main__product-code">{{ $t('text.vendor_code') }}: {{ product.vendor_code }}</span>
								</div>
								<button class="main__delete" @click="removeRelatedProduct(product)"></button>
							</div>
						</div>
					</div>
					<div class="main__inner main__inner--end">
						<button class="btn modal-btn" @click="showAddRelatedProductModal">
							{{ $t('text.add_related_product') }}
						</button>
					</div>
					<div class="main__inner main__inner--short">
						<!-- Аналоги -->
						<span class="main__text">{{ $t('text.analogs') }}</span>
						<div class="main__block main__block--column" v-if="analogs">
							<div :key="idx" v-for="(analog, idx) in analogs" class="main__product">
								<div class="main__product-group">
									<span>
									<a
										target='_blank' 
										:href="removeSubdomain(analog.url)"
										:title="$t('text.open_on_site')" style='margin-right: 5px;'>
										<svg width="11" height="10"><g clip-path="url(#a)" stroke="#428AB4"><path stroke-width="2" d="M6 1h-8m3-1v8M0 9h8m0 1V5m-4.507.138 6.794-4"/><path d="M8 .5h3m-3 0h3m-3 0h3m-.5-.5v3"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h11v10H0z"/></clipPath></defs></svg>
									</a>
									<a
										target='_blank'
										:href="`/dashboard/products/item?edit=${analog.similar_product_id}`"
										:title="$t('text.open_on_dashboard')"
										class="main__product-name"
										><span v-html="`${analog.name}`"></span
									></a>
									</span>
									
									<span class="main__product-code">{{ $t('text.vendor_code') }}: {{ analog.vendor_code }}</span>
								</div>
								<button class="main__delete" @click="removeAnalog(analog)"></button>
							</div>
						</div>
					</div>
					<div class="main__inner main__inner--end">
						<label class="checkbox-group">
							<span>{{ $t('text.change_parameters_data_from_added') }}</span>
							<input type="checkbox" class="checkbox-group__checkbox" v-model="isProductToAnalog" />
						</label>
					</div>
					<div class="main__inner main__inner--end">
						<button class="btn modal-btn" @click="showAddAnalogModal">
							{{ $t('text.add_analog') }}
						</button>
					</div>
				</div>
			</div>

			<!--PARAMETERS TAB 2-->
			<div class="tabs__content" :class="{ 'tabs__content--active': activeTab === 'param' }" v-if="activeTab === 'param'">
				<div class="main__content">
					<div
						:key="paramIdx"
						class="main__inner main__inner--short main__inner--top mb-10"
						v-for="(parameter, paramIdx) in currentParameters">
						<span class="main__text">
							{{ parameter?.feature_data[0]?.name }}<span class="star">{{ parameter.is_required === 'Y' ? '*' : '' }}</span>
						</span>
						<div class="main__block main__block--column">
							<input
								type="text"
								class="main__input input"
								@input="() => (requiredParameterError[parameter?.feature_data[0].id] = '')"
								:id="'p'+parameter?.feature_data[0].id"
								v-model="parameter.val"
								:placeholder="parameter?.overview_text" />

							<!--RADIO-->
							<div class="main__group mb-10" v-if="parameter?.feature_data[0].type === 'radio'">
								<label :key="idx" class="checkbox-group" v-for="(value, idx) in parameter?.feature_data[0].preset_values">
									<input
										type="radio"
										:name="'radio_' + parameter?.feature_data[0].id"
										:value="value"
										:checked="value===parameter.val"
										class="checkbox-group__checkbox"
										@click="
											() => {
												parameter.val = value;
											}
										" />
									<span>{{ value }}</span>
								</label>
							</div>
							<!--CHECKBOX-->
							<div class="main__group mb-10" v-if="parameter?.feature_data[0].type === 'checkbox'">
								<label :key="idx" class="checkbox-group" v-for="(value, idx) in parameter?.feature_data[0].preset_values">
									<input
										:name="'checkboxes_' + parameter?.feature_data[0].id"
										:id="parameter?.feature_data[0].id+'_'+idx"
										type="checkbox"
										:value="value"
										class="checkbox-group__checkbox"
										@click="
											() => {
												//parameter.val = value;
											}
										" />
									<span>{{ value }}</span>
								</label>
							</div>
						</div>
						<span
							v-if="parameter.is_required === 'Y'"
							class="main__error main__error-message"
							v-html="requiredParameterError[parameter?.feature_data[0].id]" />
						<span
							v-if="errors?.errors && errors?.errors[`features.${paramIdx}.value`]?.length"
							class="main__error main__error-message"
							v-html="errors?.errors[`features.${paramIdx}.value`][0]" />
					</div>
				</div>
			</div>

			<!-- LINKS TAB -->
			<div class="tabs__content" :class="{ 'tabs__content--active': activeTab === 'links' }" v-if="activeTab === 'links'">
				<div class="main__content">
					<div class="main__inner main__inner--short main__inner--top">
						<span class="main__text">
							{{ $t('text.links_drivers') }}<br>
							<span style="color: #c0c0c0;">{{ $t('text.links_drivers_desc1') }}</span><br>
							<span style="color: #c0c0c0;">{{ $t('text.links_drivers_desc2') }}</span>
						</span>
						<textarea
							style="field-sizing:content;"
							class="main__textarea textarea"
							v-model="driversLinks"
							></textarea>
					</div>
					
					<div class="main__inner main__inner--short main__inner--top">
						<span class="main__text">
							{{ $t('text.links_manuals') }}<br>
							<span style="color: #c0c0c0;">{{ $t('text.links_manuals_desc1') }}</span><br>
							<span style="color: #c0c0c0;">{{ $t('text.links_manuals_desc2') }}</span>
						</span>
						<textarea
							style="field-sizing:content;"
							class="main__textarea textarea"
							v-model="manualsLinks"
							></textarea>
						
					</div>
			    </div>
			</div>
			
			<!-- ADVERTISEMENT TAB 3 -->
			<div class="tabs__content" :class="{ 'tabs__content--active': activeTab === 'ads' }" v-if="activeTab === 'ads'">
				<div class="main__content">
					<div class="main__inner main__inner--short main__inner--top">
						<span class="main__text">{{ $t('text.alternative_name_ads') }}</span>
						<textarea
							class="main__textarea textarea"
							v-model="alterName"
							:placeholder="$t('text.alternative_name_ads_placeholder')"></textarea>
					</div>
					<div class="main__inner main__inner--short main__inner--top">
						<span class="main__text">{{ $t('text.pn_ads') }}</span>
						<textarea class="main__textarea textarea" v-model="pn" :placeholder="$t('text.pn_ads')"></textarea>
					</div>
					<div class="main__inner main__inner--short">
						<span class="main__text">{{ $t('text.name_for_y_market') }}</span>
						<input
							type="text"
							class="main__input input"
							v-model="yandexMarketName"
							:placeholder="$t('text.name_for_y_market_placeholder')" />
					</div>
					<div class="main__inner main__inner--short main__inner--top">
						<span class="main__text">{{ $t('text.desc_ads') }}</span>
						<textarea
							class="main__textarea textarea"
							v-model="adOverviewText"
							:placeholder="$t('text.prod_desc_for_yml')"></textarea>
					</div>

					<div class="main__inner main__inner--end">
						<label for="avatar-upload" class="avatar avatar--long">
							<span class="avatar__text">{{ $t('text.photo_ads') }}</span>
							<input type="file" @change="uploadImage($event)" id="avatar-upload" accept="image/jpeg" class="avatar__input" />
							<div class="avatar__img">
								<img
									:src="
										previewImage
											? previewImage
											: product?.ad_yandex_market[0]?.picture_url
											? product?.ad_yandex_market[0]?.picture_url
											: defaultImg
									"
									alt="Photo" />
							</div>
							<span class="avatar__btn btn">{{ $t('text.photo_ads_add') }}</span>
						</label>
					</div>

					<div class="main__inner main__inner--end">
						<label for="type-checkbox" class="checkbox-group">
							<span>{{ $t('text.export_to_y_market') }}</span>
							<input type="checkbox" id="type-checkbox" v-model="adIsActive" class="checkbox-group__checkbox" />
						</label>
					</div>
				</div>
			</div>
		</div>
		<div class="main__inner main__inner--center">
			<button class="btn mb-50" @click="saveOrUpdate(isEditMode ? 'update' : 'save')">
				{{ isEditMode ? $t('text.edit_button') : $t('text.add_button') }}
			</button>
		</div>
		<!--MODALS-->
		<app-product-data-copy-modal
			v-if="isProductToAnalogVisible"
			@closeModal="() => (isProductToAnalogVisible = false)"
			@emit-form-data="getDataFromDataCopyModal" />
		<app-product-data-copy-from-analog-modal
			v-if="isProductFromAnalogVisible"
			@closeModal="() => (isProductFromAnalogVisible = false)"
			@emit-form-data="getDataToCopyFromAnalog" />
		<app-add-analog-or-related-product
			:show="isAnalog ? isAddAnalogModalVisible : isAddRelatedProductVisible"
			:isAnalog="isAnalog"
			:productTypeId="currentProductType?.id"
			@setCurrentAnalogData="setCurrentAnalogData"
			@close-modal="closeModal"
			@toggleProductDataCopy="showProductFromAnalog"
			@addProducts="addProducts"></app-add-analog-or-related-product>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, onBeforeMount, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import toaster from '../../../utils/toaster';
import { MainState } from '../../../store/mainStore';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import productsService from '../../../services/productsService';
import productTypesService from '../../../services/productTypesService';
import catalogSectionsService from '../../../services/catalogSectionsService';
import priceTypesService from '../../../services/priceTypesService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useAnalogsOrRelatedProducts from '../../../composables/pages/dashboard/useAnalogsOrRelatedProducts';
import AppImageLoader from '../../_components/AppImageLoader.vue';
import AppAddAnalogOrRelatedProduct from '../../_components/dashboard/products/AppAddAnalogOrRelatedProduct.vue';
import AppProductDataCopyModal from '../../_components/dashboard/products/AppProductDataCopyModal.vue';
import AppProductDataCopyFromAnalogModal from '../../_components/dashboard/products/AppProductDataCopyFromAnalogModal.vue';
import useImageHandler from '../../../composables/pages/dashboard/useImageHandler';
import { DEFAULT_PIC, IMG_SECTION_PATH, MATRIX_SECTIONS, removeSubdomain } from '../../../utils/constants';
import brandsService from '../../../services/brandsService';
import useProductData from '../../../composables/pages/dashboard/products/useProductData';
import sleep from '../../../utils/sleep';
import feature from '../../../localization/feature';
import redirect from '../../../utils/redirect';
import matrixTypesService from '../../../services/matrixTypesService';

let editor = null;
let loadData = false;
const FIXED_HEADER_HEIGHT = 0;
const store = useStore<MainState>();
const toast = inject('toast') as any;
const localization: any = useI18n();
const imgPath = ref(IMG_SECTION_PATH);
const defaultImg = ref(DEFAULT_PIC);
const product = ref();
const sourceProductForBasedOn = ref(null); // Храним исходный товар для режима "на основе"
const baseUrl = import.meta.env.VITE_API_URL;
//const radio = ref([]);
const checkboxes = ref([]);
const requiredParameterError = ref([]);
const {
	analogs,
	isAnalog,
	isAddAnalogModalVisible,
	isAddRelatedProductVisible,
	relatedProducts,
	addAnalogs,
	addRelatedProducts,
	showAddAnalogModal,
	showAddRelatedProductModal,
} = useAnalogsOrRelatedProducts();
// FormData
const title = ref('');
const vendorCode = ref();
const brandId = ref<any>(0);
const productType = ref<any>(0);
const catalogSection = ref<any>(0);
const currentCatalogSection = ref<any>([]);
const overviewText = ref('');
const whereSnText = ref('');
const createdAt = ref('');
const saveEditorValue = ref('');
const stockStatus = ref({
	name: localization.t('text.not_available'),
	value: 'out_of_stock',
});
const { stockStatusOptions, errorNames, guid } = useProductData();
const { canEdit, canView, itemId, isEditMode } = usePageInit('catalog.products');
const isHidden = ref(false);
const adsRotator = ref(false);
const notForEveryone = ref(false);
const productFeaturesInitComplete = ref(false);
const currentPriceTypes = ref([]);
const loadEditorComplete = ref(false);
let editorToolbarListenersBound = false;

const resetEditorToolbarFixedStyles = () => {
	const toolbarBox = document.querySelector('.product-page-main-tab .jodit-toolbar__box') as HTMLElement | null;
	const editorContainer = document.querySelector('.product-page-main-tab .jodit-container') as HTMLElement | null;
	const editorWorkplace = editorContainer?.querySelector('.jodit-workplace') as HTMLElement | null;

	if (!toolbarBox) return;

	toolbarBox.classList.remove('product-editor-toolbar--fixed');
	toolbarBox.style.removeProperty('left');
	toolbarBox.style.removeProperty('top');
	toolbarBox.style.removeProperty('width');

	if (editorWorkplace) {
		editorWorkplace.style.removeProperty('margin-top');
	}
};

const updateEditorToolbarStickyState = () => {
	if (activeTab.value !== 'main') {
		resetEditorToolbarFixedStyles();
		return;
	}

	const toolbarBox = document.querySelector('.product-page-main-tab .jodit-toolbar__box') as HTMLElement | null;
	const editorContainer = document.querySelector('.product-page-main-tab .jodit-container') as HTMLElement | null;
	const editorWorkplace = editorContainer?.querySelector('.jodit-workplace') as HTMLElement | null;

	if (!toolbarBox || !editorContainer) return;

	const containerRect = editorContainer.getBoundingClientRect();
	const toolbarHeight = toolbarBox.offsetHeight;
	const shouldFixToolbar = containerRect.top <= FIXED_HEADER_HEIGHT && (containerRect.bottom - toolbarHeight - FIXED_HEADER_HEIGHT) > 0;

	if (shouldFixToolbar) {
		toolbarBox.classList.add('product-editor-toolbar--fixed');
		toolbarBox.style.left = `${containerRect.left}px`;
		toolbarBox.style.top = `${FIXED_HEADER_HEIGHT}px`;
		toolbarBox.style.width = `${containerRect.width}px`;

		if (editorWorkplace) {
			editorWorkplace.style.marginTop = `${toolbarHeight}px`;
		}
	} else {
		resetEditorToolbarFixedStyles();
	}
};

const bindEditorToolbarStickyListeners = () => {
	if (editorToolbarListenersBound) return;

	window.addEventListener('scroll', updateEditorToolbarStickyState, { passive: true });
	window.addEventListener('resize', updateEditorToolbarStickyState);
	editorToolbarListenersBound = true;
};

const unbindEditorToolbarStickyListeners = () => {
	if (!editorToolbarListenersBound) return;

	window.removeEventListener('scroll', updateEditorToolbarStickyState);
	window.removeEventListener('resize', updateEditorToolbarStickyState);
	editorToolbarListenersBound = false;
	resetEditorToolbarFixedStyles();
};

const onDragStart = (e: DragEvent | any, company: object) => {
	if (canEdit.value) {
		e.dataTransfer.dropEffect = 'move';
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('company', JSON.stringify(company));
	}
};

const activeParams = () => {
	let checkIntervalAp = setInterval(function () {
		if (productFeaturesInitComplete.value === true) {
			clearInterval(checkIntervalAp);

			let savedValues = {};
			product.value.features.forEach(productFeature => {
				if (productFeature.type == 'checkbox') {
					if (document.getElementById('p' + productFeature.pivot.feature_id) !== null) {
						document.getElementById('p' + productFeature.pivot.feature_id).value = '';
					}
					
					const allCheckbox = document.querySelectorAll('input[name="checkboxes_' + productFeature.pivot.feature_id + '"]');

					if(typeof savedValues[productFeature.pivot.feature_id] === "undefined") {
						savedValues[productFeature.pivot.feature_id] = [];
					}
					
					savedValues[productFeature.pivot.feature_id].push(productFeature.pivot.value);
					
					allCheckbox.forEach(checkbox => {
						if(checkbox.value == productFeature.pivot.value) {
							checkbox.checked = true;
						}
					});
				}
			});

			for (const featureId in savedValues) {
				multiValues.value[featureId] = savedValues[featureId].join(";;;");
			}
		}
	}, 300);
};
	
const onDrop = async (e: DragEvent | any, droppedPhoto: any) => {
	const data = {
		photos: [],
	};
	const draggedCompany = JSON.parse(e.dataTransfer.getData('company'));
	const tempArr = fetchedProductPhotos.value.filter(company => company.order !== draggedCompany.order);
	tempArr.splice(droppedPhoto.order - 1, 0, draggedCompany);
	tempArr.forEach((item, index) => (item.order = index + 1));
	data.photos = tempArr.map(item => {
		return {
			is_main: item.order === 1 ? 'Y' : 'N',
			pos: item.order,
			photo_id: item.id,
		};
	});
	fetchedProductPhotos.value = [...tempArr];
	store.commit('setLoading', true);
	await productsService.changeImageOrder(localization, data, errMsg => {
		toaster.error(toast, errMsg);
	});
	store.commit('setLoading', true);
	await initProduct();
};

const removeRelatedProduct = product => {
	relatedProducts.value = relatedProducts.value.filter(p => p.related_product_id !== product.related_product_id);
};
const removeAnalog = async (analog) => {
	store.commit('setLoading', true);
	analogs.value = analogs.value.filter(a => a.similar_product_id !== analog.similar_product_id);
	await productsService.deleteSimilar(localization, itemId.value, analog.similar_product_id, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
	//deletedAnalogs.value.push(analog.similar_product_id);
};
const currentRelatedProductsIds = computed(() =>
	relatedProducts.value.map(product => {
		return product.related_product_id;
	}),
);
const currentAnalogsIds = computed(() =>
	analogs.value.map(product => {
		return product.similar_product_id;
	}),
);
const currentFeatures = computed(() =>
	currentParameters.value
		?.map(feature => {
			const value = (feature.feature_data[0].type == 'radio' || feature.feature_data[0].type == 'only_input') ? htmlDecode(feature.val) : getMultiValue(feature.feature_id);
			if (!value) return null;
			return {
				feature_id: feature.feature_id,
				values: [
					{
						lang: localization.locale.value,
						value: value,
					},
				],
			};
		})
		.filter(feature => feature !== null),
);
const alterName = ref();
const pn = ref();
const yandexMarketName = ref();
const adOverviewText = ref();
const adImageUrl = ref();
const adIsActive = ref(false);
const driversLinks = ref();
const manualsLinks = ref();
const multiValues = ref([]);
	
const getMultiValue = (feature_id) => {
	return multiValues.value[feature_id];
}

const saveMultiValue = () => {
	if (productFeaturesInitComplete.value === true) {
		currentParameters.value.forEach(productFeature => {
			if (productFeature.feature_data[0].type === 'checkbox') {
				let feature_id = productFeature.feature_id;
				
				let inputValue = (document.getElementById('p' + feature_id) !== null) ? document.getElementById('p' + feature_id).value.trim() : "";
	
				const checked = document.querySelectorAll('input[name="checkboxes_' + feature_id + '"]:checked');
				let data = Array.from(checked).map(feature => htmlDecode(feature.value)).join(';;;');
			
				if (inputValue != '') {
					data += ';;;' + inputValue;
				}

				//console.log(feature_id +' = '+ data);
				const uniqueValues = [...new Set(data.split(";;;"))]; 
				multiValues.value[feature_id] = uniqueValues.join(";;;");
			}
		});
	}
}


// Функция для конвертации формата даты из datetime-local в формат API (YYYY-MM-DD HH:mm:ss)
const formatDateTimeForAPI = (dateTimeLocal: string): string | undefined => {
	if (!dateTimeLocal) return undefined;
	// datetime-local формат может быть: YYYY-MM-DDTHH:mm или YYYY-MM-DDTHH:mm:ss или YYYY-MM-DDTHH:mm:ss.sss
	// API формат: YYYY-MM-DD HH:mm:ss
	let result = dateTimeLocal.replace('T', ' ');
	
	// Убираем миллисекунды, если они есть
	result = result.replace(/\.\d+$/, '');
	
	// Если формат уже содержит секунды (YYYY-MM-DD HH:mm:ss), возвращаем как есть
	if (result.match(/:\d{2}:\d{2}$/)) {
		return result;
	}
	
	// Если секунд нет (формат YYYY-MM-DD HH:mm), добавляем :00
	if (result.match(/:\d{2}$/)) {
		return result + ':00';
	}
	
	return result;
};

const sendData: any = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: title.value,
		},
	],
	overview_texts: [
		{
			lang: localization.locale.value,
			value: editor.getEditorValue().replaceAll("'", '"'),
		},
	],
	where_sn: whereSnText.value,
	vendor_code: vendorCode.value,
	random_id: randomId.value,
	brand_id: brandId.value,
	product_group_id: currentProductType.value?.id,
	catalog_section_id: currentCatalogSection.value,
	is_hidden: isHidden.value ? 'Y' : 'N',
	ads_rotator: adsRotator.value ? 'Y' : 'N',
	not_for_everyone: notForEveryone.value ? 'Y' : 'N',
	stock_status: stockStatus.value.value,
	uuid: newGuid.value,
	related_products: currentRelatedProductsIds.value,
	similar_products: currentAnalogsIds.value,
	prices: currentPriceTypes.value,
	features: currentFeatures.value,
	copy_data_to_similar_products: {
		desc: 'N',
		related_products: 'N',
		brand: 'N',
		features: 'N',
		pn: 'N',
		alt_names: 'N',
	},
	matrix_type_id: showMatrixTypeSelect.value && matrixTypeId.value ? matrixTypeId.value : undefined,
	created_at: isEditMode.value && createdAt.value ? formatDateTimeForAPI(createdAt.value) : undefined,
}));

const toValidate = computed(() => ({    
	names: [
		{
			lang: localization.locale.value,
			value: title.value,
		},
	],
	overview_texts: [
		{
			lang: localization.locale.value,
			value: editor.getEditorValue().replaceAll("'", '"'),
		},
	],
	where_sn: whereSnText.value,
	vendor_code: vendorCode.value,
	brand_id: brandId.value,
	product_group_id: currentProductType.value?.id,
	catalog_section_id: currentCatalogSection.value,
	is_hidden: isHidden.value ? 'Y' : 'N',
	ads_rotator: adsRotator.value ? 'Y' : 'N',
	not_for_everyone: notForEveryone.value ? 'Y' : 'N',
	stock_status: stockStatus.value.value,
	related_products: currentRelatedProductsIds.value,
	similar_products: currentAnalogsIds.value,
	prices: currentPriceTypes.value,
	features: currentFeatures.value,
}));

const checkCheckbox = (parameter, value) => {
	parameter.val.push(value);
	parameter.val = Array.from(new Set(parameter.val.map(t => t)));
};

const priceTypes = ref();
const productTypes = ref();
const catalogSections = ref();
const brands = ref();
const fetchedProductPhotos = ref<any>([]);
const allProducts = ref<any>([]);
const allCatalogSections = ref<any>([]);
const newGuid = ref();
const htmlDecode = function (input) {
	var doc = new DOMParser().parseFromString(input, 'text/html');
	return doc.documentElement.textContent;
};

const randomId = ref();
const initProduct = async () => {
	const [productData, productTypesData, priceTypesData] = await Promise.all([
		productsService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)),
		productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		priceTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg))
	]);

	if (productData.sections?.some(section => MATRIX_SECTIONS.includes(section.name))) {
		const matrixTypeData = await matrixTypesService.getProductMatrixTypeId(
			localization, 
			itemId.value, 
			errMsg => toaster.error(toast, errMsg)
		);
		
		if (matrixTypeData?.success) {
			matrixTypeId.value = matrixTypeData.data.matrix_type_id;
		}
	}

	[product.value, productTypes.value, priceTypes.value] = [productData, productTypesData, priceTypesData];
	
	loadData = true;
	
	productType.value = productTypes.value.find(productType => productType.id === product.value.product_group_id);
	productFeaturesInit();
	title.value = htmlDecode(product.value.name);
	vendorCode.value = product.value.vendor_code;
	brandId.value = product.value.brand_id;
	catalogSection.value = product.value.sections[0]?.pivot?.section_id;
	currentCatalogSection.value = [];
	currentCatalogSection.value.push(product.value.sections.id);
	catalogSections.value = catalogSections.value.filter(section => section.product_group_id === productType.value.id);
	catalogSectionInit();
	overviewText.value = product.value.overview_text;
	whereSnText.value = product.value.where_sn || '';
	// Конвертируем created_at из формата API (YYYY-MM-DD HH:mm:ss) в формат datetime-local (YYYY-MM-DDTHH:mm:ss)
	if (product.value.created_at) {
		// Формат API: "2025-10-23 15:27:08" -> формат datetime-local: "2025-10-23T15:27:08"
		createdAt.value = product.value.created_at.replace(' ', 'T');
	} else {
		createdAt.value = '';
	}
	stockStatus.value = stockStatusOptions.value.filter(status => product.value.stock_status === status.value)[0];
	isHidden.value = product.value.is_hidden === 'Y';
	adsRotator.value = product.value.ads_rotator === 'Y';
	notForEveryone.value = product.value.not_for_everyone === 'Y';
	if (isEditMode.value) {
		newGuid.value = product.value.uuid;
	}

	fetchedProductPhotos.value = product.value.photos.map((photo, idx) => ({
		path: photo.file_path,
		id: photo.id,
		file_name: photo.file_name,
		pos: idx + 1,
		order: photo.order,
	}));
	fetchedProductPhotos.value.sort((a, b) => a.order - b.order);
	currentPriceTypes.value = priceTypes.value.map(pt => {
		const currPrice = product.value.prices.filter(fetchedPrice => fetchedPrice.price_type_id === pt.id)[0]?.value;
		const priceValue = (!currPrice) ? 0 : currPrice;
		
		return {
			price_type_id: pt.id,
			value: priceValue,
			name: pt.name,
			vendor_code: pt.code,
		};
	});
	relatedProducts.value = product.value.related_products;
	analogs.value = product.value.similar_products;
	yandexMarketName.value = product.value.ad_yandex_market[0]?.name;
	adOverviewText.value = product.value.ad_yandex_market[0]?.overview_text;
	adImageUrl.value = product.value.ad_yandex_market[0]?.picture_url;
	adIsActive.value = product.value.ad_yandex_market[0]?.is_active === 'Y';
	alterName.value = product.value.ad_generator[0]?.alt_names;
	pn.value = product.value.ad_generator[0]?.pn;
	driversLinks.value = getLinksText('drivers', product.value?.materials_urls);
	manualsLinks.value = getLinksText('manuals', product.value?.materials_urls);
	
	let activeTabName = location.hash.replace("#", "");
	if (activeTabName != '') {
		setActiveTab(activeTabName);
	}
};
const setCheckboxValuesFromSource = (sourceProduct: any) => {
	// Устанавливаем значения checkbox после инициализации параметров
	if (!sourceProduct.features || !currentParameters.value) return;
	
	let checkInterval = setInterval(function () {
		if (productFeaturesInitComplete.value === true) {
			clearInterval(checkInterval);
			
			// Группируем features по feature_id для обработки множественных значений
			const featuresById = {};
			sourceProduct.features.forEach(sourceFeature => {
				if (sourceFeature.type === 'checkbox' && sourceFeature.pivot) {
					const featureId = sourceFeature.id;
					if (!featuresById[featureId]) {
						featuresById[featureId] = {
							feature: sourceFeature,
							values: []
						};
					}
					featuresById[featureId].values.push(sourceFeature.pivot.value);
				}
			});
			
			// Обрабатываем каждую группу
			Object.keys(featuresById).forEach(featureId => {
				const { feature, values } = featuresById[featureId];
				const inputElement = document.getElementById('p' + featureId);
				if (inputElement !== null) {
					inputElement.value = '';
				}
				
				const allCheckboxes = document.querySelectorAll('input[name="checkboxes_' + featureId + '"]');
				
				// Объединяем все значения и обрабатываем разделители
				let allValues = [];
				values.forEach(value => {
					// Определяем разделитель
					let separator = feature.value_separator || ',';
					if (value.includes(';;;')) {
						separator = ';;;';
					} else if (value.includes(separator)) {
						// Используем value_separator
					} else {
						// Одно значение без разделителя
						allValues.push(value.trim());
						return;
					}
					
					// Разбиваем значение на отдельные значения
					const splitValues = value.split(separator).map(v => v.trim()).filter(v => v);
					allValues = allValues.concat(splitValues);
				});
				
				// Убираем дубликаты
				allValues = [...new Set(allValues)];
				
				// Отмечаем соответствующие checkbox
				allCheckboxes.forEach(checkbox => {
					if (allValues.includes(checkbox.value)) {
						checkbox.checked = true;
					}
				});
				
				// Сохраняем значение в multiValues (используем стандартный разделитель ";;;")
				multiValues.value[featureId] = allValues.join(';;;');
			});
		}
	}, 300);
};

const fillFormFromProduct = async (sourceProduct: any) => {
	// Проверяем, что справочники загружены
	if (!productTypes.value || !Array.isArray(productTypes.value) || productTypes.value.length === 0) {
		console.error('Справочники не загружены');
		return;
	}
	
	// Заполняем основные поля (кроме vendor_code и photos)
	title.value = htmlDecode(sourceProduct.name);
	
	// Устанавливаем бренд
	if (sourceProduct.brand_id && brands.value && Array.isArray(brands.value)) {
		brandId.value = sourceProduct.brand_id;
	}
	
	// Устанавливаем тип товара
	if (sourceProduct.product_group_id) {
		const foundProductType = productTypes.value.find(pt => pt.id === sourceProduct.product_group_id);
		if (foundProductType) {
			productType.value = foundProductType;
			await productFeaturesInit();
			// Небольшая задержка для гарантии инициализации параметров
			await sleep(100);
		}
	}
	
	// Устанавливаем категорию
	if (sourceProduct.sections && sourceProduct.sections.length > 0 && catalogSections.value && Array.isArray(catalogSections.value)) {
		const sectionId = sourceProduct.sections[0].id;
		// Проверяем, что категория существует в справочнике
		const foundSection = catalogSections.value.find(s => s.id === sectionId);
		if (foundSection) {
			catalogSection.value = sectionId;
			catalogSectionInit();
		}
	}
	
	// Заполняем описание
	if (sourceProduct.overview_text) {
		overviewText.value = sourceProduct.overview_text;
	}
	
	// Заполняем where_sn
	if (sourceProduct.where_sn) {
		whereSnText.value = sourceProduct.where_sn;
	}
	
	// Устанавливаем статус наличия
	if (sourceProduct.stock_status) {
		const foundStatus = stockStatusOptions.value.find(status => status.value === sourceProduct.stock_status);
		if (foundStatus) {
			stockStatus.value = foundStatus;
		}
	}
	
	// Устанавливаем флаги
	isHidden.value = sourceProduct.is_hidden === 'Y';
	adsRotator.value = sourceProduct.ads_rotator === 'Y';
	notForEveryone.value = sourceProduct.not_for_everyone === 'Y';
	
	// Заполняем цены
	if (sourceProduct.prices && sourceProduct.prices.length > 0 && currentPriceTypes.value && Array.isArray(currentPriceTypes.value)) {
		currentPriceTypes.value = currentPriceTypes.value.map(pt => {
			const sourcePrice = sourceProduct.prices.find(p => p.price_type_id === pt.price_type_id);
			return {
				...pt,
				value: sourcePrice ? sourcePrice.value.toString() : '0',
			};
		});
	}
	
	// Заполняем параметры (features)
	if (sourceProduct.features && sourceProduct.features.length > 0 && currentParameters.value) {
		// Группируем features по feature_id для обработки множественных значений checkbox
		const featuresById = {};
		sourceProduct.features.forEach(sourceFeature => {
			if (sourceFeature.type === 'checkbox' && sourceFeature.pivot) {
				const featureId = sourceFeature.id;
				if (!featuresById[featureId]) {
					featuresById[featureId] = {
						feature: sourceFeature,
						values: []
					};
				}
				featuresById[featureId].values.push(sourceFeature.pivot.value);
			}
		});
		
		currentParameters.value.forEach(param => {
			if (param.feature_data[0].type === 'checkbox' && featuresById[param.feature_id]) {
				// Для checkbox обрабатываем множественные значения
				const { feature, values } = featuresById[param.feature_id];
				let allValues = [];
				values.forEach(value => {
					let separator = feature.value_separator || ',';
					if (value.includes(';;;')) {
						separator = ';;;';
					} else if (value.includes(separator)) {
						// Используем value_separator
					} else {
						allValues.push(value.trim());
						return;
					}
					const splitValues = value.split(separator).map(v => v.trim()).filter(v => v);
					allValues = allValues.concat(splitValues);
				});
				allValues = [...new Set(allValues)];
				param.val = allValues;
				// Сохраняем значение для multiValues (используем стандартный разделитель ";;;")
				multiValues.value[param.feature_id] = allValues.join(';;;');
			} else {
				// Для других типов параметров (radio, only_input)
				const sourceFeature = sourceProduct.features.find(f => f.id === param.feature_id);
				if (sourceFeature && sourceFeature.pivot) {
					param.val = sourceFeature.pivot.value || param.default_value;
				}
			}
		});
		productFeaturesInitComplete.value = true;
		// Устанавливаем значения checkbox после инициализации DOM
		setCheckboxValuesFromSource(sourceProduct);
	}
	
	// Заполняем сопутствующие товары
	if (sourceProduct.related_products && sourceProduct.related_products.length > 0) {
		relatedProducts.value = sourceProduct.related_products.map(rp => ({
			vendor_code: rp.vendor_code,
			name: rp.name,
			related_product_id: rp.related_product_id,
			url: rp.url,
		}));
	}
	
	// Заполняем аналоги
	if (sourceProduct.similar_products && sourceProduct.similar_products.length > 0) {
		analogs.value = sourceProduct.similar_products.map(sp => ({
			vendor_code: sp.vendor_code,
			name: sp.name,
			similar_product_id: sp.similar_product_id,
			url: sp.url,
		}));
	}
	
	// Заполняем рекламу Яндекс.Маркет
	if (sourceProduct.ad_yandex_market && sourceProduct.ad_yandex_market.length > 0) {
		const ad = sourceProduct.ad_yandex_market[0];
		yandexMarketName.value = ad.name || '';
		adOverviewText.value = ad.overview_text || '';
		adImageUrl.value = ad.picture_url || '';
		adIsActive.value = ad.is_active === 'Y';
	}
	
	// Заполняем альтернативные названия
	if (sourceProduct.ad_generator && sourceProduct.ad_generator.length > 0) {
		const adGen = sourceProduct.ad_generator[0];
		alterName.value = adGen.alt_names || '';
		pn.value = adGen.pn || '';
	}
	
	// Заполняем ссылки на материалы
	if (sourceProduct.materials_urls && sourceProduct.materials_urls.length > 0) {
		driversLinks.value = getLinksText('drivers', sourceProduct.materials_urls);
		manualsLinks.value = getLinksText('manuals', sourceProduct.materials_urls);
	}
	
	// Устанавливаем тип матрицы, если нужно
	if (sourceProduct.sections?.some(section => MATRIX_SECTIONS.includes(section.name))) {
		// Здесь можно попытаться получить matrix_type_id из исходного товара, если он есть
		// Но так как в API ответе нет этого поля напрямую, оставляем пустым
	}
};

onBeforeMount(async () => {
	randomId.value = Math.floor(Math.random() * 999999999);
	if (!canEdit.value) redirect('/dashboard/products');
	
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	const basedOnPid = urlParams.get('based_on_pid');
	
	(itemId.value == null) ? await store.dispatch('setActiveProductId', randomId.value) : await store.dispatch('setActiveProductId', itemId.value);
	
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	
	store.commit('setLoading', true);
	
	try {
		// Сначала загружаем все справочники
		const [productTypesData, catalogSectionsData, priceTypesData, brandsData, matrixTypesData] = await Promise.all([
			productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
			catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg), '?model=product&orderField=name'),
			priceTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
			brandsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
			matrixTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		]);
		
		// Устанавливаем загруженные справочники
		[productTypes.value, allCatalogSections.value, priceTypes.value, brands.value, matrixTypes.value] = [
			productTypesData, 
			catalogSectionsData, 
			priceTypesData, 
			brandsData, 
			matrixTypesData
		];
		
		catalogSections.value = allCatalogSections.value;
		currentPriceTypes.value = priceTypes.value.map(pt => ({
			price_type_id: pt.id,
			value: '0',
			name: pt.name,
		}));
		
		// Теперь, когда справочники загружены, загружаем данные товара
		if (isEditMode.value) {
			await initProduct();
		} else if (basedOnPid) {
			// Режим создания товара на основе другого товара
			try {
				const sourceProduct = await productsService.get(localization, basedOnPid, errMsg => {
					console.error('Ошибка при загрузке товара:', errMsg);
					toaster.error(toast, errMsg || 'Ошибка при загрузке данных товара');
				});
				if (sourceProduct && sourceProduct.id) {
					sourceProductForBasedOn.value = sourceProduct; // Сохраняем для использования при переключении вкладок
					await fillFormFromProduct(sourceProduct);
					loadData = true;
				} else {
					console.error('Товар не найден или данные некорректны');
					toaster.error(toast, 'Товар не найден или данные некорректны');
				}
			} catch (error) {
				console.error('Ошибка при загрузке данных товара:', error);
				toaster.error(toast, error?.message || 'Ошибка при загрузке данных товара');
			}
		} else {
			loadData = true;
		}
	} catch (error) {
		console.error('Ошибка при загрузке справочников:', error);
		toaster.error(toast, 'Ошибка при загрузке данных');
	} finally {
		store.commit('setLoading', false);
	}
});

const activeTab = ref('main');

const setActiveTab = tab => {
	window.location.hash = tab;
	activeTab.value = tab;

	if (loadEditorComplete.value === true && tab == 'main') {
		saveEditorValue.value = editor.getEditorValue();
		editor.destruct();
		editor = null;

		let checkIntervalEdtr = setInterval(function () {
		    if(document.getElementById('editor') !== null) {
			clearInterval(checkIntervalEdtr);

			initEditor();
			editor.setEditorValue(saveEditorValue.value);
			updateEditorToolbarStickyState();
			    
			loadEditorComplete.value = true;
		    }
		}, 100);
	}
	
	if(tab == 'param') {
		if (isEditMode.value) {
			activeParams();
		} else if (sourceProductForBasedOn.value) {
			setCheckboxValuesFromSource(sourceProductForBasedOn.value);
		}
	}
};

const getLinksText = (type, items) => {
	if (!items) return '';
	
	/*
	// Новый формат: объект с ключами drivers/manuals, каждый содержит массив объектов {lang, value}
	if (items[type] && Array.isArray(items[type])) {
		// Фильтруем элементы по активному языку
		const activeLangItems = items[type].filter(item => item.lang === localization.locale.value);
		
		// Если есть элементы с активным языком, используем их, иначе берем все
		const itemsToUse = activeLangItems.length > 0 ? activeLangItems : items[type];
		
		// Собираем value каждого элемента в отдельную строку
		return itemsToUse
			.map(item => item.value || '')
			.filter(value => value.trim() !== '')
			.join("\r\n");
	}
	*/
	
	// Старый формат: массив объектов с type, title, url (для обратной совместимости)
	if (Array.isArray(items)) {
		let data = [];
		items.forEach(item => {
			if(item.type == type) {
				data.push(item.title + ";" + item.url);
			}
		});
		return data.join("\r\n");
	}
	
	return '';
};

const initEditor = () => {
	editor = Jodit.make("#editor", {
		"language": "ru",
		"disablePlugins": "add-new-line,spellcheck,speech-recognize,search,print,powered-by-jodit,iframe,focus,ai-assistant,about",
		"defaultActionOnPaste": "insert_as_text",
		"imageDefaultWidth": "100%",
		"minHeight": 400,
		"width": '70%',
		"maxWidth": '70%',
		"enter": "p",
		"spellcheck": false,
		"useSearch": false,
		"toolbarButtonSize": "middle",
		"buttons": [
			'source', '|',
			'bold',
			'strikethrough',
			'underline',
			'italic', '|',
			'align', 'undo', 'redo', '|',
			'ul',
			'ol', '|',
			'outdent', 'indent',  '|',
			'font',
			'fontsize',
			'brush',
			'paragraph', '|',
			'image',
			'link', '|',
			'fullsize',
		],
		"style": {
		     "font": '13px Helvetica,Arial,sans-serif',
		     "color": '#151515',
		}
	});

	bindEditorToolbarStickyListeners();
	setTimeout(updateEditorToolbarStickyState, 0);
};

const currentParameters = ref();
const currentProductType = ref();
const productTypeParameter = ref(null);
const setCatalogSectionsByProductTypeId = () => {
	if (productType.value.id) {
		catalogSections.value = allCatalogSections.value.filter(section => {
			return section.product_group_id === productType.value.id;
		});
		catalogSection.value = 0;
	}
};
const productFeaturesInit = async () => {
	setCatalogSectionsByProductTypeId();
	if (productType.value.id) {
		store.commit('setLoading', true);
		currentProductType.value = await productTypesService.get(localization, productType.value.id, errMsg =>
			toaster.error(toast, errMsg),
		);
		store.commit('setLoading', false);
		currentParameters.value = currentProductType.value.features || [];
		currentParameters.value.forEach(param => {
			param.val = param.feature_data[0].type === 'checkbox' ? [] : '';
			param.val = param.default_value;
			if (isEditMode.value) {
				product.value.features.forEach(productFeature => {
					if (productFeature.id === param.feature_id) {
						param.val = productFeature.pivot.value ? productFeature.pivot.value : param.default_value;
					}
				});
			}
		});
		productFeaturesInitComplete.value = true;
		// analogs.value = [];
	}
};

const { validate, errors, removeError } = useValidationHandler();
const create = async (sendData: object, errNames: string[] = errorNames) => {
	await sleep(1);
	store.commit('setLoading', true);

	const response: any = await productsService.create(localization, sendData, errNames, errMsg => {
		toaster.error(toast, errMsg);
		store.commit('setLoading', false);
	});
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessCreated'));
		window.location.replace('/dashboard/products/');
	}
	store.commit('setLoading', false);
	return response;
};

const update = async (id: number | string, sendData: object) => {
	await sleep(1);
	store.commit('setLoading', true);
	const response: any = await productsService.update(localization, id, sendData, errorNames, errMsg => {
		toaster.error(toast, errMsg);
		store.commit('setLoading', false);
	});
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
	}
	
	await initProduct();
	store.commit('setLoading', false);
	//location.reload();
};
let isClicked = false;
const saveOrUpdate = async (selector): Promise<void> => {
	if (activeTab.value != 'main') {
		setActiveTab('main');
		loadEditorComplete.value = false;
	}
	
	let checkIntervalSoU = setInterval(async function () {
		if (loadEditorComplete.value === true && editor.getEditorValue !== null) {
			clearInterval(checkIntervalSoU);

			isClicked = true;

			if (validate(isClicked, toValidate.value) && !store.state.isPictureError) {
				if (yandexMarketName.value || adOverviewText.value || adImageUrl.value) {
					sendData.value.ad_yandex_market = {
						name: yandexMarketName.value,
						overview_text: adOverviewText.value,
						picture_url: previewImage.value ? baseUrl + adImageUrl.value.photo_path : product.value?.ad_yandex_market[0]?.picture_url,
						is_active: adIsActive.value ? 'Y' : 'N',
					};
				}
				
				// Разбиваем driversLinks по строкам - каждая строка = отдельный элемент массива
				const driversArray = driversLinks.value && driversLinks.value.trim()
					? driversLinks.value
							.split(/\r?\n/)
							.filter(line => line.trim() !== '')
							.map(line => ({
								lang: localization.locale.value,
								value: line.trim(),
							}))
					: [];
				
				// Разбиваем manualsLinks по строкам - каждая строка = отдельный элемент массива
				const manualsArray = manualsLinks.value && manualsLinks.value.trim()
					? manualsLinks.value
							.split(/\r?\n/)
							.filter(line => line.trim() !== '')
							.map(line => ({
								lang: localization.locale.value,
								value: line.trim(),
							}))
					: [];
				
				sendData.value.materials_urls = {
					drivers: driversArray,
					manuals: manualsArray,
				};
				
				if (alterName.value || pn.value) {
					sendData.value.ad_generator = {
						alt_names: alterName.value,
						pn: pn.value,
					};
				}
				
				if (productPhotos.value.length) {
					store.commit('setLoading', true);
					await uploadImages(newGuid.value, isEditMode.value ? product.value.id : null);
					store.commit('setLoading', false);
				}

				let hasRequiredParameterError = false;
				currentParameters.value.forEach(feature => {
					if (feature.is_required === 'Y' && !feature.val) {
						//console.log(feature);

						hasRequiredParameterError = true;
						requiredParameterError.value[feature.feature_id] = 'Поле обязательно для заполнения';
						activeTab.value = 'param';
					}
				});
		
				/*
				if (isEditMode.value && deletedAnalogs.value.length) {
					store.commit('setLoading', true);
					for await (const analogId of deletedAnalogs.value) {
						await productsService.deleteSimilar(localization, itemId.value, analogId, errMsg => toaster.error(toast, errMsg));
					}
		
					store.commit('setLoading', false);
				}
				*/
				
				/*
				if (isEditMode.value) {
					// delete sendData.value.similar_products;
					for (const analog of analogs.value) {
						store.commit('setLoading', true);
						await productsService.setSimilar(localization, itemId.value, analog.similar_product_id, errMsg =>
							toaster.error(toast, errMsg),
						);
						store.commit('setLoading', false);
					}
				} else {
					if (Array.isArray(currentAnalogsIds.value) && currentAnalogsIds.value.length > 0) {
						for (let z = 0; z < currentAnalogsIds.value.length; z++) {
							let savedAnalogs = await productsService.setSimilar(localization, randomId.value, currentAnalogsIds.value[z], errMsg => {
								toaster.error(toast, errMsg);
								store.commit('setLoading', false);
							});
						}
					}
				}
				*/
		
				if (selector === 'save' && !hasRequiredParameterError) {
					await create(sendData.value);
				} else if (selector !== 'save' && !hasRequiredParameterError) {
					await update(itemId.value, sendData.value);
				}
			}
			if (errors.value?.errors) {
				setActiveTab('main');
			}
			if (errors.value?.errors && errors.value?.errors['features.0.value']?.length) {
				setActiveTab('param');
			}
	    	}
	}, 300);
};
//const deletedAnalogs = ref([]);
const isProductToAnalog = ref(false);
const isProductToAnalogVisible = ref(false);
watch(
	() => isProductToAnalog.value,
	() => {
		isProductToAnalogVisible.value = !!isProductToAnalog.value;
	},
);
const isProductFromAnalogVisible = ref(false);
const analogForChangeData = ref();
const getDataToCopyFromAnalog = data => {
	if (analogForChangeData.value.ad_generator.length && data.alt_names && data.alt_names === 'Y') {
		alterName.value = analogForChangeData.value.ad_generator[0].alt_names;
	}
	if (data.brand === 'Y') {
		brandId.value = analogForChangeData.value.brand_id;
	}
	if (data.desc === 'Y') {
		overviewText.value = analogForChangeData.value.overview_text;
	}
	if (data.features === 'Y' && currentParameters.value) {
		currentParameters.value?.forEach(param => {
			analogForChangeData.value.features.forEach(productFeature => {
				if (productFeature.id === param.feature_id) {
					param.val = productFeature.pivot.value;
				}
			});
		});
	}
	if (analogForChangeData.value.ad_generator.length && data.pn && data.pn === 'Y') {
		pn.value = analogForChangeData.value.ad_generator[0].pn;
	}
	if (data.related_products === 'Y') {
		analogForChangeData.value.related_products;
		relatedProducts.value = analogForChangeData.value.related_products;
	}
	isProductFromAnalogVisible.value = false;
};

const setCurrentAnalogData = async data => {
	store.commit('setLoading', true);
	analogForChangeData.value = await productsService.get(localization, data[0].id, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
};
const showProductFromAnalog = () => {
	isProductFromAnalogVisible.value = true;
};

const getDataFromDataCopyModal = dataToSimilarProducts => {
	sendData.value.copy_data_to_similar_products = { ...dataToSimilarProducts };
};

const closeModal = () => {
	isAddAnalogModalVisible.value = isAddRelatedProductVisible.value = false;
};

const addProducts = products => {
	if (isAnalog.value) {
		products.forEach(product => {
			const mappedAnalog = {
				vendor_code: product.vendor_code,
				name: product.name,
				similar_product_id: product.id,
				url: removeSubdomain(product.url),
			};
			analogs.value.push(mappedAnalog);
		});
	} else {
		const prdcts = products.map(product => ({
			vendor_code: product.vendor_code,
			name: product.name,
			related_product_id: product.id,
			url: removeSubdomain(product.url),
		}));

		addRelatedProducts(prdcts);
	}
};

const catalogSectionInit = () => {
	currentCatalogSection.value = [];
	currentCatalogSection.value.push(catalogSection.value);
	removeError(errors?.value?.errors?.catalog_section_id);
};
const removeFetchedPhoto = async id => {
	store.commit('setLoading', true);
	await productsService.removePhoto(localization, id, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
	fetchedProductPhotos.value = fetchedProductPhotos.value.filter(photo => photo.id !== id);
};
const { previewImage, productPhotos, imageLoading, uploadImages, makeImagePreview, saveImage } = useImageHandler(
	productsService,
	'adphoto',
);

const uploadImage = async e => {
	makeImagePreview(e);
	adImageUrl.value = await saveImage('');
};
onMounted(() => {
	newGuid.value = guid();

	//if (activeTab.value == 'param') {
		activeParams();
	//}

	let checkIntervalMv = setInterval(function () {
		if(activeTab.value == 'param') {
			saveMultiValue();		
		}
	}, 150);

	let editorScript = document.createElement('script');
	editorScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/jodit/4.2.50/es2021/jodit.min.js');
	document.head.appendChild(editorScript);

	let editorScriptIsReady = false;
	let checkInterval = setInterval(function () {
	      if (Jodit && loadData === true && document.getElementById('editor') !== null) {
	        editorScriptIsReady = true;
	        clearInterval(checkInterval);

		initEditor();
		updateEditorToolbarStickyState();

		loadEditorComplete.value = true;
	      }
	      return editorScriptIsReady;
	    }, 300);
});

onBeforeUnmount(() => {
	unbindEditorToolbarStickyListeners();
});

// Добавляем refs
const matrixTypes = ref([]);
const matrixTypeId = ref(0);

// Добавляем computed свойство
const showMatrixTypeSelect = computed(() => {
	return catalogSections.value?.find(section => 
		section.id === catalogSection.value && MATRIX_SECTIONS.includes(section.name)
	);
});
</script>

<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/jodit/4.2.50/es2021/jodit.min.css";

.star {
	color: red;
}

.main__product-name::before {
    display: none !important;
}

/* Закрепление панели инструментов Jodit при прокрутке (вкладка «Главная») */
.product-page-main-tab .jodit-toolbar__box {
	background: #f9f9f9;
	box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}

.product-page-main-tab .jodit-toolbar__box.product-editor-toolbar--fixed {
	position: fixed;
	z-index: 100;
}
</style>
