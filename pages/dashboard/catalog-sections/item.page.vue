<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" v-if="canEdit">
		<main class="main">
			<div class="tabs">
				<ul class="tabs__list" role="tablist">
					<li class="tabs__item" :class="{ 'tabs__item--active': !seoIsActive }">
						<button @click="toggleSeo" class="tabs__button">{{ $t('text.main') }}</button>
					</li>
					<li class="tabs__item" :class="{ 'tabs__item--active': seoIsActive }">
						<button @click="toggleSeo" class="tabs__button">{{ $t('text.seo_parameters') }}</button>
					</li>
				</ul>
				<!-- Главная  -->
				<div class="tabs__content" :class="{ 'tabs__content--active': !seoIsActive }">
					<div class="main__content main__content--column">
						<div class="main__wrapper">
							<div class="main__inner main__inner--short">
								<span class="main__text">{{ $t('text.name') }}</span>
								<input
									type="text"
									v-model="sectionName"
									class="main__input input"
									:placeholder="$t('text.name_placeholder')"
									@input="removeError(errors?.errors['names.0.value'])" />
								<p v-if="errors?.errors" class="main__error" v-for="error in errors?.errors['names.0.value']" :key="error">
									{{ error }}
								</p>
							</div>
							<div class="main__inner main__inner--short">
								<span class="main__text">{{ $t('text.starting_text_product_name') }}</span>
								<input
									type="text"
									v-model="startingTextProductName"
									class="main__input input"
									:placeholder="$t('text.starting_text_placeholder')"
									@input="removeError(errors?.errors['starting_text_product_name'])" />
								<p v-if="errors?.errors" class="main__error" v-for="error in errors?.errors['starting_text_product_name']" :key="error">
									{{ error }}
								</p>
							</div>
							<!-- Подраздел -->
							<div class="main__inner main__inner--short">
								<span class="main__text">{{ $t('text.parent_section') }}</span>
								<select
									class="main__select select"
									v-model="parentSectionModel"
									@change="changeCurrentOrder(parentSectionModel)">
									<option value="0">{{ $t('text.parent_section_placeholder') }}</option>
									<option v-for="section in parentSections" :value="section.id" :key="section.id">
										{{ section.name }}
									</option>
								</select>
								<p
									v-if="errors?.errors"
									class="main__error"
									v-for="error in errors?.errors['parent_section_id']"
									:key="error">
									{{ error }}
								</p>
							</div>
							<div class="main__inner main__inner--short">
								<span class="main__text">{{ $t('text.catalog_group') }}</span>
								<select class="main__select select" v-model="productTypeModel">
									<option value="0" disabled>{{ $t('text.catalog_group_placeholder') }}</option>
									<option :value="productType.id" v-for="productType in productTypes" :key="productType.id">
										{{ productType.plural_name }}
									</option>
								</select>
								<p
									v-if="errors?.errors"
									class="main__error"
									v-for="error in errors?.errors['product_group_id']"
									:key="error">
									{{ error }}
								</p>
							</div>
							<div class="main__inner main__inner--short">
								<span class="main__text">{{ $t('text.sorting_method') }}</span>
								<select class="main__select select" v-model="sortingMethod">
									<option value="default" disabled>{{ $t('text.sorting_method_placeholder') }}</option>
									<option :value="sortingMethod.value" v-for="sortingMethod in sortingMethods" :key="sortingMethod.value">
										{{ sortingMethod.name }}
									</option>
								</select>
								<p v-if="errors?.errors" class="main__error" v-for="error in errors?.errors['sorting_method']" :key="error">
									{{ error }}
								</p>
							</div>
							<div class="main__inner main__inner--short main__inner--top">
								<span class="main__text">{{ $t('text.additional_text') }}</span>
								<textarea
									v-model="additionalText"
									class="main__textarea main__textarea--md textarea"
									@input="removeError(errors?.errors?.additional_text)"
									:placeholder="$t('text.additional_text_placeholder')"></textarea>
								<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors.additional_text" />
							</div>
							<div class="main__inner main__inner--end">
								<label for="avatar-upload" class="avatar avatar--long">
									<span class="avatar__text">{{ $t('text.icon') }}</span>
									<input
										type="file"
										@change="uploadImage($event)"
										id="avatar-upload"
										accept="image/*"
										class="avatar__input" />
									<div class="avatar__img">
										<img
											:src="
												previewImage
													? previewImage
													: currentSection?.thumbnail
													? imgPath + currentSection?.thumbnail
													: defaultImg
											"
											alt="Photo" />
									</div>
									<span class="avatar__btn btn">{{ $t('text.choose_button') }}</span>
								</label>
							</div>
							<div class="main__inner main__inner--end">
								<label class="checkbox-group">
									<span>{{ $t('text.is_active_tab_parameters') }}</span>
									<input v-model="isActiveTabParameters" type="checkbox" class="checkbox-group__checkbox" />
								</label>
								<p v-if="errors?.errors" class="main__error" v-for="error in errors?.errors['is_active_tab_parameters']" :key="error">
									{{ error }}
								</p>
							</div>
							<div class="main__inner main__inner--end">
								<label class="checkbox-group">
									<span>{{ $t('text.is_bp_disabled') }}</span>
									<input v-model="isBpDisabled" type="checkbox" class="checkbox-group__checkbox" />
								</label>
								<p v-if="errors?.errors" class="main__error" v-for="error in errors?.errors['is_bp_disabled']" :key="error">
									{{ error }}
								</p>
							</div>
							<div class="main__inner main__inner--end">
								<label class="checkbox-group">
									<span>{{ $t('text.hide_section') }}</span>
									<input v-model="isHidden" type="checkbox" class="checkbox-group__checkbox" />
								</label>
								<p v-if="errors?.errors" class="main__error" v-for="error in errors?.errors['is_hidden']" :key="error">
									{{ error }}
								</p>
							</div>

							<div class="main__inner main__inner--end">
								<label class="checkbox-group">
									<span>{{ $t('text.not_for_everyone') }}</span>
									<input v-model="notForEveryone" type="checkbox" class="checkbox-group__checkbox" />
								</label>
								<p v-if="errors?.errors" class="main__error" v-for="error in errors?.errors['not_for_everyone']" :key="error">
									{{ error }}
								</p>
							</div>
						</div>
					</div>
				</div>
				<!-- СЕО параметры -->
				<div class="tabs__content" :class="{ 'tabs__content--active': seoIsActive }">
					<div class="main__content main__content--column">
						<div class="main__wrapper">
							<div class="main__inner main__inner--short">
								<span class="main__text">{{ $t('text.subsection') }}</span>
								<div class="main__block">
									<span class="main__text">{{ sectionName }}</span>
								</div>
							</div>
							<div class="main__inner main__inner--short main__inner--top">
								<span class="main__text">{{ $t('text.phrases') }}</span>
								<textarea
									class="main__textarea textarea"
									:placeholder="$t('text.initial_phrases')"
									v-model="startingPhrases"></textarea>
								<p
									v-if="errors?.errors"
									class="main__error"
									v-for="error in errors?.errors['seo.starting_phrases']"
									:key="error">
									{{ error }}
								</p>
							</div>
							<div class="main__inner main__inner--short main__inner--top">
								<span class="main__text">{{ $t('text.seo_text') }}</span>
								<textarea
									class="main__textarea textarea"
									:placeholder="$t('text.seo_text_placeholder')"
									v-model="seoDesc"></textarea>
								<p v-if="errors?.errors" class="main__error" v-for="error in errors?.errors['seo.desc']" :key="error">
									{{ error }}
								</p>
							</div>
						</div>
					</div>
				</div>
				<div class="main__inner main__inner--end mr-20" style='margin-bottom: 40px;'>
					<button v-if="isEditMode" @click="saveOrUpdate('update')" class="btn">{{ $t('text.update_button') }}</button>
					<button v-else @click="saveOrUpdate('save')" class="btn">{{ $t('text.add_button') }}</button>
				</div>
			</div>
		</main>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import catalogSectionsService from '../../../services/catalogSectionsService';
import productTypesService from '../../../services/productTypesService';
import { DEFAULT_PIC, IMG_SECTION_PATH } from '../../../utils/constants';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import useImageHandler from '../../../composables/pages/dashboard/useImageHandler';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
const imgPath = ref(IMG_SECTION_PATH);
const defaultImg = ref(DEFAULT_PIC);
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const seoIsActive = ref(false);
const isHidden = ref();
const notForEveryone = ref();
const sectionName = ref();
const order = ref();
const parentSectionModel = ref<any>(0);
const productTypeModel = ref(0);
const sortingMethod = ref('default');
const parentSections = ref<any>(null);
const productTypes = ref();
const currentSection = ref();
const startingPhrases = ref();
const seoDesc = ref();
const startingTextProductName = ref();
const isActiveTabParameters = ref();
const isBpDisabled = ref();
const additionalText = ref();

const sortingMethods = [
	{
		name: localization.t('text.by_novelty'),
		value: 'by_novelty',
	},
	{
		name: localization.t('text.by_availability'),
		value: 'by_availability',
	},
	{
		name: localization.t('text.by_prices'),
		value: 'by_prices',
	},
	{
		name: localization.t('text.by_alphabet'),
		value: 'by_alphabet',
	},
	{
		name: localization.t('text.by_views'),
		value: 'by_views',
	},
];

const errorNames = [
	'is_hidden',
	'names',
	'names.0.lang',
	'names.0.value',
	'order',
	'parent_section_id',
	'product_group_id',
	'sorting_method',
	'seo',
	'seo.desc',
	'seo.starting_phrases',
	'is_active_tab_parameters',
	'is_bp_disabled',
	'additional_text',
	'starting_text_product_name',
	'not_for_everyone',
];

const toggleSeo = () => {
	seoIsActive.value = !seoIsActive.value;
};

const seo = ref({
	starting_phrases: null,
	desc: null,
});

const { canEdit, canView, itemId } = usePageInit('catalog.sections');
const isEditMode = ref(false);
let currentOrder = '';
const allSections = ref();
onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/catalog-sections');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		isEditMode.value ? catalogSectionsService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : [],
	])
		.then(values => ([allSections.value, productTypes.value, currentSection.value] = [...values]))
		.then(() => {
			parentSections.value = allSections.value.filter(item => item.level_nesting <= 2);
			if (isEditMode.value) {
				sectionName.value = currentSection.value.name;
				productTypeModel.value = currentSection.value.product_group_id;
				parentSectionModel.value = currentSection.value.parent_section_id;
				sortingMethod.value = currentSection.value.sorting_method;
				currentOrder = currentSection.value.order;
				seoDesc.value = currentSection.value.seo_desc;
				additionalText.value = currentSection.value.additional_text;
				startingTextProductName.value = currentSection.value.starting_text_product_name;
				isActiveTabParameters.value = currentSection.value.is_active_tab_parameters === 'Y' ? true : false;
				isBpDisabled.value = currentSection.value.is_bp_disabled === 'Y' ? false : true;
				isHidden.value = currentSection.value.is_hidden === 'Y' ? true : false;
				notForEveryone.value = currentSection.value.not_for_everyone === 'Y' ? true : false;
				startingPhrases.value = currentSection.value.seo_starting_phrases
					? currentSection.value?.seo_starting_phrases?.join(', ')
					: '';
			} else {
				const mainParents = parentSections.value.filter(section => section.parent_section_id === null);
				currentOrder = mainParents.length + 1;
			}
		})
		.then(() => store.commit('setLoading', false));
});

const changeCurrentOrder = section => {
	const parentSection = allSections.value.find(s => s.id === section);
	currentOrder = allSections.value.filter(s => s.parent_section_id === parentSection.id).length + 1;
};

const sendData = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: sectionName.value,
		},
	],
	parent_section_id: parentSectionModel.value === 'default' ? null : parentSectionModel.value,
	product_group_id: productTypeModel.value ? productTypeModel.value : null,
	is_hidden: isHidden.value ? 'Y' : 'N',
	not_for_everyone: notForEveryone.value ? 'Y' : 'N',
	is_active_tab_parameters: isActiveTabParameters.value ? 'Y' : 'N',
	is_bp_disabled: isBpDisabled.value ? 'N': 'Y',
	sorting_method: sortingMethod.value,
	order: currentOrder,
	seo: seo.value,
	starting_text_product_name: startingTextProductName.value,
	additional_text: additionalText.value,
}));

const sendDataWithoutSeo = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: sectionName.value,
		},
	],
	parent_section_id: parentSectionModel.value === 'default' ? null : parentSectionModel.value,
	product_group_id: productTypeModel.value ? productTypeModel.value : null,
	is_hidden: isHidden.value ? 'Y' : 'N',
	not_for_everyone: notForEveryone.value ? 'Y' : 'N',
	is_active_tab_parameters: isActiveTabParameters.value ? 'Y' : 'N',
	is_bp_disabled: isBpDisabled.value ? 'N' : 'Y',
	sorting_method: sortingMethod.value,
	order: currentOrder,
	starting_text_product_name: startingTextProductName.value,
	additional_text: additionalText.value,
}));

const { previewImage, makeImagePreview, saveImage } = useImageHandler(catalogSectionsService, 'icon');

const { validate, errors, removeError } = useValidationHandler();

const { create, update } = useCreateOrUpdate(catalogSectionsService, errorNames, '/dashboard/catalog-sections/');

let isClicked = false;

/* eslint-disable */
const saveOrUpdate = async selector => {
	isClicked = true;
	if (seoDesc.value || startingPhrases.value) {
		const dirtyArr = startingPhrases.value ? startingPhrases?.value.split(',') : [];
		seo.value.starting_phrases = startingPhrases.value ? dirtyArr.map(item => item.trim()) : null;
		seo.value.desc = seoDesc.value ? seoDesc.value : null;
		if (validate(isClicked, sendDataWithoutSeo.value)) {
			let response;
			selector === 'save' ? (response = await create(sendData.value)) : (response = await update(itemId.value, sendData.value));
			await saveImage(response.id);
			return;
		}
	}
	if (validate(isClicked, sendDataWithoutSeo.value)) {
		sendData.value.seo = null;
		if (selector === 'save') {
			const response = await create(sendData.value);
			await saveImage(response.id, evt);
		}
		if (selector === 'update') {
			await update(itemId.value, sendData.value);
		}
	}
	if (errors.value?.errors) {
		seoIsActive.value = false;
	}
};
/* eslint-enable */
let evt = null;
const uploadImage = e => {
	evt = e;

	makeImagePreview(e);
	if (isEditMode.value) saveImage(currentSection.value.id);
};
</script>
