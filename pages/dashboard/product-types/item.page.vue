<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" v-if="canEdit">
		<div class="main__sub"></div>
		<div class="main__content main__content--column">
			<div class="main__wrapper">
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.name_plural') }}</span>
					<input
						type="text"
						class="main__input input ml-15"
						:placeholder="$t('text.name_plural_placeholder')"
						v-model="pluralName"
						@input="removeError(errors?.errors['plural_names.0.value'])" />
					<p class="main__error main__error-message" v-if="errors?.errors && errors?.errors['plural_names.0.value']">
						{{ errors?.errors['plural_names.0.value'][0] }}
					</p>
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.name_singular') }}</span>
					<input
						type="text"
						class="main__input input ml-15"
						:placeholder="$t('text.name_singular_placeholder')"
						v-model="singularName"
						@input="removeError(errors?.errors['singular_names.0.value'])" />
					<p class="main__error main__error-message" v-if="errors?.errors && errors?.errors['singular_names.0.value']">
						{{ errors?.errors['singular_names.0.value'][0] }}
					</p>
				</div>
				<div class="main__inner main__inner--short main__inner--top">
					<span class="main__text">{{ $t('text.text_all') }}</span>
					<textarea
						class="main__textarea textarea ml-20"
						:placeholder="$t('text.text_all_placeholder')"
						v-model.trim="overviewText"
						@input="removeError(errors?.errors['overview_texts'])"></textarea>
					<p class="main__error main__error-message" v-if="errors?.errors && errors?.errors['overview_texts']">
						{{ errors?.errors['overview_texts'][0] }}
					</p>
				</div>
				<div class="main__inner main__inner--short main__inner--top">
					<span class="main__text">{{ $t('text.where_sn_desc') }}</span>
					<textarea
						class="main__textarea textarea ml-20"
						:placeholder="$t('text.where_sn_desc_placeholder')"
						v-model.trim="whereSnDesc"
						@input="removeError(errors?.errors['where_sn_descs.0.value'])"></textarea>
					<p class="main__error main__error-message" v-if="errors?.errors && errors?.errors['where_sn_descs.0.value']">
						{{ errors?.errors['where_sn_descs.0.value'][0] }}
					</p>
				</div>
				
				<!-- Чекбоксы для сервисов -->
				<div class="main__inner main__inner--short" style="display: flex; justify-content: flex-end;">
					<label class="checkbox-group">
						<span>{{ $t('text.replacement_only') }}</span>
						<input type="checkbox" v-model="replacementOnly" class="checkbox-group__checkbox" />
					</label>
				</div>
				<div class="main__inner main__inner--short" style="display: flex; justify-content: flex-end;">
					<label class="checkbox-group">
						<span>{{ $t('text.hidden_for_service') }}</span>
						<input type="checkbox" v-model="hiddenForService" class="checkbox-group__checkbox" />
					</label>
				</div>
				
				<!-- Параметры  -->
				<div class="main__inner" v-if="!!features?.length">
					<h2 class="main__title">{{ $t('text.parameters') }}</h2>
				</div>
				<div :key="feature.id" v-for="(feature, index) in features">
					<div style="padding: 15px 0 15px 0">
						<div>
							<div class="main__inner main__inner--props">
								<div class="main__group mb-15">
									<!-- Remove parameter -->
									<div class="main__elem">
										<button class="cross" :title="$t('text.remove')" @click="removeParameter(index)"></button>
									</div>
									<div>
										<!-- Features select  -->
										<select
											class="main__select select"
											@change="checkParameter(feature.feature_id, errors?.errors[`features.${index}.feature_id`])"
											v-model="feature.feature_id">
											<option value="-1" selected disabled>{{ $t('text.parameter_name') }}</option>
											<option :key="idx" :value="allFeature.id" v-for="(allFeature, idx) in allFeatures">
												{{ allFeature.name }}
											</option>
										</select>
										<div
											class="feature__error featurename__error"
											v-if="errors?.errors && errors?.errors[`features.${index}.values.0.value`]"
											v-html="errors?.errors[`features.${index}.values.0.value`][0]" />

										<div
											class="feature__error"
											v-if="errors?.errors"
											v-html="errors?.errors[`features.${index}.feature_id`]" />
										<input
											type="text"
											class="main__input input"
											:placeholder="$t('text.default_value')"
											v-model="features[index].default_value"
											@input="removeError(errors?.errors[`features.${index}.values.0.value`])" />
									</div>
								</div>
								<!-- isMain  -->
								<label class="checkbox-group">
									<span>{{ $t('text.main') }}</span>
									<input type="checkbox" v-model="features[index].is_main" class="checkbox-group__checkbox" />
								</label>
								<!-- isRequired  -->
								<label class="checkbox-group">
									<span>{{ $t('text.required') }}</span>
									<input type="checkbox" v-model="features[index].is_required" class="checkbox-group__checkbox" />
								</label>
							</div>
							<div class="main__inner main__inner--full mb-25">
								<div class="dug_product_type">
									<select 
										@change="updateOrderFeatures(features[index], $event, null)"
										class="main__select select">
										<option v-for="(, indx) in features" 
											:selected="indx==index"
											:value="(indx + 1)">{{ (indx + 1) }}</option>
									</select>
									<div style='text-align: center; margin-top: 8px;'>
										<span @click="updateOrderFeatures(feature, $event, index)" style='cursor: pointer; padding: 5px;'><img src='../../../assets/img/arrow_order.svg' :alt="$t('text.parameter_up')" :title="$t('text.parameter_up')" style='transform:rotate(180deg);' /></span>
										<span @click="updateOrderFeatures(feature, $event, index+2)" style='cursor: pointer; padding: 5px;'><img src='../../../assets/img/arrow_order.svg' :alt="$t('text.parameter_down')" :title="$t('text.parameter_down')" style='margin-left: 6px;' /></span>
									</div>
								</div>
								<!-- error -->
								<div
									class="feature__error"
									v-if="errors?.errors && errors?.errors[`features.${index}.overview_texts.0.value`]"
									v-html="errors?.errors[`features.${index}.overview_texts.0.value`][0]" />
								<textarea
									class="main__textarea textarea"
									:placeholder="$t('text.description_filter')"
									v-model="feature.overview_text"
									@input="removeError(errors?.errors[`features.${index}.overview_texts.0.value`])">
								</textarea>
							</div>
						</div>
					</div>
				</div>

				<!-- Добавить параметр  -->
				<div class="main__inner">
					<button class="main__btn main__btn--add" @click="addParameter">{{ $t('text.add_parameter') }}</button>
				</div>
				<div class="main__inner main__inner--end">
					<button v-if="isEditMode" @click="saveOrUpdate('update')" class="btn">{{ $t('text.update') }}</button>
					<button v-else @click="saveOrUpdate('save')" class="btn">{{ $t('text.add') }}</button>
				</div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import productTypesService from '../../../services/productTypesService';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';

const toast = inject('toast') as any;
const store = useStore<MainState>();
const localization: any = useI18n();
const pickupPoints = ref();
const companies = ref();
const productType = ref();
const pluralName = ref();
const singularName = ref();
const overviewText = ref();
const whereSnDesc = ref();
const features = ref([]) as any;
const replacementOnly = ref(false);
const hiddenForService = ref(false);

const { canEdit, canView, itemId, isEditMode } = usePageInit('catalog.groups');

const errorNames = (): string[] => {
	const arrFeatureId: string[] = [];
	const arrFeatureIsRequired: string[] = [];
	const arrFeatureIsMain: string[] = [];
	const arrFeatureOrder: string[] = [];
	const arrFeatureOverviewTexts: string[] = [];
	const arrFeatureOverviewTextsLang: string[] = [];
	const arrFeatureOverviewTextsValue: string[] = [];
	const arrFeatureValues: string[] = [];
	const arrFeatureValuesLang: string[] = [];
	const arrFeatureValuesValue: string[] = [];
	let counter = 0;
	for (const feature of features.value) {
		arrFeatureId.push(`features.${counter}.feature_id`);
		arrFeatureIsRequired.push(`features.${counter}.is_required`);
		arrFeatureIsMain.push(`features.${counter}.is_main`);
		arrFeatureOrder.push(`features.${counter}.order`);
		arrFeatureOverviewTexts.push(`features.${counter}.overview_text`);
		arrFeatureOverviewTextsLang.push(`features.${counter}.overview_text.0.lang`);
		arrFeatureOverviewTextsValue.push(`features.${counter}.overview_text.0.value`);
		arrFeatureValues.push(`features.${counter}.values`);
		arrFeatureValuesLang.push(`features.${counter}.values.0.lang`);
		arrFeatureValuesValue.push(`features.${counter}.values.0.value`);
		counter++;
	}
	return [
		'features',
		...arrFeatureId,
		...arrFeatureIsRequired,
		...arrFeatureIsMain,
		...arrFeatureOrder,
		...arrFeatureOverviewTexts,
		...arrFeatureOverviewTextsLang,
		...arrFeatureOverviewTextsValue,
		...arrFeatureValues,
		...arrFeatureValuesLang,
		...arrFeatureValuesValue,
		'overview_texts',
		'overview_texts.0.lang',
		'overview_texts.0.value',
		'where_sn_descs',
		'where_sn_descs.0.lang',
		'where_sn_descs.0.value',
		'plural_names',
		'plural_names.0.lang',
		'plural_names.0.value',
		'singular_names',
		'singular_names.0.lang',
		'singular_names.0.value',
		'replacement_only',
		'hidden_for_service',
		'group_exist',
	];
};

const order = ref(0);

const checkParameter = (id, err) => {
	if (err) removeError(err);
	for (let index = 0; index < features.value.length - 1; index++) {
		if (features.value[index].feature_id === id) {
			toaster.error(toast, 'Такой параметр уже существует');
			features.value[features.value.length - 1].feature_id = -1;
			break;
		}
	}
};

const updateOrderFeatures = (feature_item, event, pos) => {
	const totalItems = features.value.length;
	const tempArr = features.value.filter(feature => feature.feature_id !== feature_item.feature_id);
	
	if (pos == null) {
		tempArr.splice(event.target.value - 1, 0, feature_item);
	} else {
		if (pos == 0) {
			pos = totalItems;
		}

		if (pos > totalItems) {
			pos = 1;
		}

		tempArr.splice(pos - 1, 0, feature_item);
	}

	features.value = tempArr;
};
	
const addParameter = () => {
	if (features.value.length) {
		order.value = features.value[features.value.length - 1].order;
	}
	const feature = {
		default_value: '',
		group_id: productType.value ? productType.value.id : '',
		is_required: false,
		is_main: false,
		overview_texts: [],
		order: order.value + 1,
		feature_id: -1,
	};
	features.value.push(feature);
	order.value = feature.order;
};

const removeParameter = index => {
	features.value.splice(index, 1);
};
const htmlDecode = function (input) {
	var doc = new DOMParser().parseFromString(input, 'text/html');
	return doc.documentElement.textContent;
};
const sendData = computed(() => ({
	plural_names: [
		{
			lang: localization.locale.value,
			value: pluralName.value ?? '',
		},
	],
	singular_names: [
		{
			lang: localization.locale.value,
			value: singularName.value ?? '',
		},
	],
	overview_texts: [
		{
			lang: localization.locale.value,
			value: (overviewText.value != null) ? overviewText.value.replace(/\\/g, '\\\\') : '',
		},
	],
	where_sn_descs: [
		{
			lang: localization.locale.value,
			value: (whereSnDesc.value != null) ? whereSnDesc.value.replace(/\\/g, '\\\\') : '',
		},
	],
	replacement_only: replacementOnly.value ? 'Y' : 'N',
	hidden_for_service: hiddenForService.value ? 'Y' : 'N',
	features: features.value.map((feature, index) => ({
		feature_id: feature.feature_id === -1 ? null : feature.feature_id,
		is_required: feature.is_required ? 'Y' : 'N',
		is_main: feature.is_main ? 'Y' : 'N',
		order: feature.order,
		values: [
			{
				lang: localization.locale.value,
				value: feature.default_value ?? '',
			},
		],
		overview_texts: [
			{
				lang: localization.locale.value,
				value: (feature.overview_text != null) ? feature.overview_text.replace(/\\/g, '\\\\') : '',
			},
		],
	})),
}));

// Validate Save or Update
const { validate, errors, removeError } = useValidationHandler();
const { create, update } = useCreateOrUpdate(productTypesService, errorNames(), '/dashboard/product-types');
let isClicked = false;
const saveOrUpdate = async selector => {
	isClicked = true;
	console.log(validate(isClicked, sendData.value));
	//console.log(errors.value);
	//console.log(sendData.value);

	if (validate(isClicked, sendData.value)) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};

const allFeatures = ref();

onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/product-types');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		productTypesService.getAllFeatures(localization, errMsg => toaster.error(toast, errMsg)),
		isEditMode.value ? productTypesService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : [],
	])
		.then(values => ([allFeatures.value, productType.value] = [...values]))
		.then(() => {
			if (isEditMode.value) {
				pluralName.value = productType.value.plural_name ? htmlDecode(productType.value.plural_name) : '';
				singularName.value = productType.value.singular_name ? htmlDecode(productType.value.singular_name) : '';
				overviewText.value = productType.value.overview_text ? htmlDecode(productType.value.overview_text) : '';
				whereSnDesc.value = productType.value.where_sn_desc ? htmlDecode(productType.value.where_sn_desc) : '';
				replacementOnly.value = productType.value.replacement_only === 'Y';
				hiddenForService.value = productType.value.hidden_for_service === 'Y';

				features.value = productType.value.features;
				features.value.forEach(feature => {
					feature.overview_text = feature.overview_text ? htmlDecode(feature.overview_text) : '';
					feature.default_value = feature.default_value ?? '';
					feature.is_required = feature.is_required === 'Y';
					feature.is_main = feature.is_main === 'Y';
				});
			}
		})
		.then(() => store.commit('setLoading', false));
});

let druggedEl: any;
const onDragStart = (e: DragEvent | any, company: object) => {
	if (canEdit.value) {
		druggedEl = e.target;
		druggedEl.style.opacity = 0.1;
		e.dataTransfer.dropEffect = 'move';
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('company', JSON.stringify(company));
	}
};

function onDrag(e) {
	if (canEdit.value) e.target.style.opacity = 0.1;
}

const onDrop = async (e: DragEvent | any, droppedFeature: any, index: number) => {
	if (canEdit.value) {
		druggedEl.style.opacity = 1;
		const draggedCompany = JSON.parse(e.dataTransfer.getData('company'));
		const tempArr = features.value.filter(feature => feature.order !== draggedCompany.order);
		tempArr.splice(droppedFeature.order - 1, 0, draggedCompany);
		droppedFeature.feature_data = draggedCompany.feature_data;
		features.value = JSON.parse(JSON.stringify(tempArr));
	}
};
</script>
<style scoped>
.feature__error {
	color: red;
	position: absolute;
	bottom: -20px;
}
.featurename__error {
	right: 0;
}

.dug_product_type {
    width: 8%;
}
</style>
