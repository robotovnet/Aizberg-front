<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__sub"></div>
		<div class="main__sub"></div>
		<div class="main__content main__content--column">
			<div class="main__wrapper">
				<div class="main__inner main__inner--full">
					<select class="main__select select" v-model="productTypeId" @change="selectProductType(productTypeId)">
						<option :value="0" disabled>{{ $t('text.product_type') }}</option>
						<option :value="productType.id" selected v-for="productType in productTypes" :key="productType.id">
							{{ productType.plural_name }}
						</option>
					</select>
				</div>
				<h3 class="main__subtitle">{{ $t('text.supported_parameters') }}</h3>
				<div
					@dragenter.prevent
					:key="feature.id"
					@dragover.prevent
					@drop="onDrop($event, feature)"
					style="padding: 15px 0 15px 0"
					v-for="feature in features">
					<div @dragstart="onDragStart($event, feature)" draggable="true">
						<div class="main__inner main__inner--short">
							<div class="cursor__drag dug_filter">
								<img src="../../../assets/img/dist/sprite.svg#icon-dots-plug" alt="drug" />
							</div>
							<div class="checkbox-group--filter">
								<label>
									<input type="checkbox" class="checkbox-group__checkbox" v-model="feature.checked" />
									<span>{{ feature?.name }}</span>
								</label>
							</div>
							<select class="main__select select" v-model="feature.filterType">
								<option :key="filterType.name" :value="filterType.value" v-for="filterType in filterTypes">
									{{ filterType.name }}
								</option>
							</select>
						</div>
					</div>
				</div>
				<div class="main__inner main__inner--end">
					<button class="btn" :disabled="!features?.length" @click="saveOrUpdate()">{{ $t('text.add_button') }}</button>
				</div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import redirect from '../../../utils/redirect';
import toaster from '../../../utils/toaster';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import catalogFiltersService from '../../../services/catalogFiltersService';
import productTypesService from '../../../services/productTypesService';
import catalogFeaturesService from '../../../services/catalogFeaturesService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const parameterName = ref();
const parameterMeasure = ref();
const parameterType = ref('default');
const isForAllGroups = ref(false);
const { canEdit, canView, itemId, isEditMode } = usePageInit('catalog.filters');
const filterTypes = ref([
	{
		name: localization.t('text.multiple_options_at_the_same_time'),
		value: 'input_with_checkbox',
	},
	{
		name: localization.t('text.range'),
		value: 'range',
	},
	{
		name: localization.t('text.only_one_of_the_options'),
		value: 'radio',
	},
	{
		name: localization.t('text.input_field_with_options'),
		value: 'checkbox',
	},
]);

const productTypes = ref();
const productType = ref();
const features = ref<any>([]);
const currentFilters = ref() as any;
const productTypeId = ref(0);
const allFeatures = ref();

const sendData = computed(() =>
	features.value
		.filter(feature => feature.checked)
		.map(f => ({
			product_group_id: f.group_id,
			feature_id: f.feature_id,
			order: f.order,
			type: f.filterType,
		})),
);

const featuresInit = type => {
	features.value = JSON.parse(JSON.stringify(type.features));
	features.value.forEach((feature, index) => {
		feature.name = allFeatures.value.find(f => f.id === feature.feature_id)?.name;
		feature.order = index + 1;
		feature.checked = false;
		feature.filterType = filterTypes.value[0].value;
	});
};

const getProductTypeById = async id => {
	const fetchedProduct = await productTypesService.get(localization, id, errMsg => toaster.error(toast, errMsg));
	featuresInit(fetchedProduct);
	return fetchedProduct;
};

const selectProductType = async id => {
	store.commit('setLoading', true);
	productType.value = await getProductTypeById(id);
	store.commit('setLoading', false);
};
const errorNames = computed(() => {
	const featureId: string[] = [];
	const featureOrder: string[] = [];
	const prodTypeId: string[] = [];
	const type: string[] = [];
	let counter = 0;
	for (const feature of features.value) {
		featureId.push(`${counter}.feature_id`);
		featureOrder.push(`${counter}.order`);
		prodTypeId.push(`${counter}.product_group_id`);
		type.push(`${counter}.type`);
		counter++;
	}
	return [...featureId, ...featureOrder, ...prodTypeId, ...type];
});

const { validate, errors, removeError } = useValidationHandler();

const { create } = useCreateOrUpdate(catalogFiltersService, errorNames.value, '/dashboard/catalog-filters');
let isClicked = false;

const saveOrUpdate = async () => {
	isClicked = true;

	if (validate(isClicked, sendData.value)) {
		await create(sendData.value);
	}
	return false;
};
onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/catalog-filters');
	document.title += ' - ' + localization.t('text.header');
	allFeatures.value = await catalogFeaturesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	const fetchedProductTypes: any = await productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	const filtersCount: any = await catalogFiltersService.getFiltersCount(localization, errMsg => toaster.error(toast, errMsg));
	for (const pType of fetchedProductTypes) {
		pType.filters = 0;
		for (const filter of filtersCount) {
			if (filter.product_group_id === pType.id) {
				pType.filters = filter.total ? filter.total : 0;
			}
		}
	}
	productTypes.value = fetchedProductTypes.filter(f => !f.filters);
});

const onDrop = (event, droppedFeature) => {
	const draggedFeature = JSON.parse(event.dataTransfer.getData('feature'));
	if (droppedFeature.id === draggedFeature.id) return;
	const tempArr = features.value.filter(feature => feature.order !== draggedFeature.order);
	tempArr.splice(droppedFeature.order - 1, 0, draggedFeature);
	tempArr.forEach((item, index) => (item.order = index + 1));
	tempArr.forEach((item, index) => (item.order = index + 1));
	features.value = JSON.parse(JSON.stringify(tempArr));
	features.value.sort((prev, next) => prev.order - next.order);
};

const onDragStart = (event, feature) => {
	event.dataTransfer.dropEffect = 'move';
	event.dataTransfer.effectAllowed = 'move';
	event.dataTransfer.setData('feature', JSON.stringify(feature));
};
</script>
