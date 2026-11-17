<template>
	<AppPage :title="$t('text.header_edit')" :can-edit="true" v-if="canEdit">
		<div class="main__sub"></div>
		<div class="main__content main__content--column">
			<div class="main__wrapper">
				<div class="main__inner">
					<h3 class="main__heading main__heading--no-margin">{{ productType?.plural_name }}</h3>
				</div>
				<div
					:key="feature.id"
					style="padding: 15px 0 15px 0"
					v-for="(feature, index) in getOnlyActiveFilters(features)">
					<div>
						<div class="main__inner main__inner--short">
							<div class="dug_filter">
								<select 
									@change="updateOrderFilters(feature, $event, null)"
									class="main__select select select_pos_filters">
									<option v-for="(, indx) in getOnlyActiveFilters(features)" 
										:selected="indx==index"
										:value="(indx + 1)">{{ (indx + 1) }}</option>
								</select>
								<div style='text-align: center; margin-top: 8px;'>
									<span @click="updateOrderFilters(feature, $event, index)" style='cursor: pointer; padding: 5px; display: inline-block;'><img src='../../../../assets/img/arrow_order.svg' :alt="$t('text.parameter_up')" :title="$t('text.parameter_up')" style='transform:rotate(180deg);' /></span>
									<span @click="updateOrderFilters(feature, $event, index+2)" style='cursor: pointer; padding: 5px; display: inline-block;'><img src='../../../../assets/img/arrow_order.svg' :alt="$t('text.parameter_down')" :title="$t('text.parameter_down')" style='margin-left: 6px;' /></span>
								</div>
							</div>
							<div class="checkbox-group--filter">
								<label>
									<input @change="updateFilters(feature)" type="checkbox" class="checkbox-group__checkbox" v-model="feature.checked" />
									<span>{{ feature?.feature_data[0]?.name }}</span>
								</label>
							</div>
							<select class="main__select select" v-model="feature.filterType">
								<option value="" selected disabled>{{ $t('text.filter_type') }}</option>
								<option :key="filterType.name" :value="filterType.value" v-for="filterType in filterTypes">
									{{ filterType.name }}
								</option>
							</select>
						</div>
					</div>
				</div>

				<div
					:key="feature.id"
					style="padding: 15px 0 15px 0"
					v-for="(feature, index) in getOnlyParameters(features)">
					<div>
						<div class="main__inner main__inner--short">
							<div class="dug_filter">
							</div>
							<div class="checkbox-group--filter">
								<label>
									<input @change="updateFilters(feature)" type="checkbox" class="checkbox-group__checkbox" v-model="feature.checked" />
									<span>{{ feature?.feature_data[0]?.name }}</span>
								</label>
							</div>
							<select class="main__select select" v-model="feature.filterType">
								<option value="" selected disabled>{{ $t('text.filter_type') }}</option>
								<option :key="filterType.name" :value="filterType.value" v-for="filterType in filterTypes">
									{{ filterType.name }}
								</option>
							</select>
						</div>
					</div>
				</div>
				
				<div class="main__inner main__inner--end">
					<button class="btn" @click="saveOrUpdate()">{{ $t('text.edit_button') }}</button>
				</div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, onBeforeMount, defineProps, toRefs, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../../store/mainStore';
import redirect from '../../../../utils/redirect';
import toaster from '../../../../utils/toaster';
import catalogFeaturesService from '../../../../services/catalogFeaturesService';
import productTypesService from '../../../../services/productTypesService';
import catalogFiltersService from '../../../../services/catalogFiltersService';
import useCreateOrUpdate from '../../../../composables/pages/dashboard/useCreateOrUpdate';
import usePageInit from '../../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../../utils/sleep';
import useValidationHandler from '../../../../composables/pages/dashboard/useValidationHandler';

const { canEdit, canView, itemId, isEditMode } = usePageInit('catalog.filters');
const props = defineProps({
	filterId: {
		type: String,
		default: 0,
		required: true,
	},
});
const { filterId } = toRefs(props);
const toast = inject('toast') as any;
const localization = useI18n();
const store = useStore<MainState>();

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
const errorNames = (): string[] => {
	const featureId: string[] = [];
	const id: string[] = [];
	const featureOrder: string[] = [];
	const prodTypeId: string[] = [];
	const type: string[] = [];

	for (let i = 0; i < 100; i++) {
		featureId.push(`${i}.feature_id`);
		id.push(`${i}.id`);
		featureOrder.push(`${i}.order`);
		prodTypeId.push(`${i}.product_group_id`);
		type.push(`${i}.type`);
	}
	return [...featureId, ...featureOrder, ...prodTypeId, ...type, ...id];
};
const productType = ref();
const allFeatures = ref();
const features = ref<any>([]);

const featuresInit = type => {
	features.value = JSON.parse(JSON.stringify(type.features));
	let currentFilters: any = null;
	features.value.forEach(feature => {
		feature.name = allFeatures.value.find(f => f.id === feature.feature_id)?.name;
		currentFilters = filters.value.filter(f => f.product_group_id === feature.group_id);
		feature.filterType = '';
		currentFilters.forEach(cFilter => {
			if (cFilter.feature_id === feature.feature_id) {
				feature.checked = true;
				feature.filterType = cFilter.type;
				feature.filterId = feature.id;
				feature.order = cFilter.order;
			}
		});
	});
	features.value.sortAscendantByField('order');
};
const featuresLength = ref();
const filters = ref();
onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/catalog-filters');
	document.title += ' - ' + localization.t('text.header_edit');
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		catalogFiltersService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		productTypesService.get(localization, filterId?.value, errMsg => toaster.error(toast, errMsg)),
		catalogFiltersService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		store.commit('setLoading', true),
	])
		.then(values => ([allFeatures.value, productType.value, filters.value] = [...values]))
		.then(() => {
			featuresLength.value = productType.value.features.length;
			featuresInit(productType.value);
		})
		.then(() => store.commit('setLoading', false));
});

const sendData = computed(() =>
	features.value
		.filter(feature => feature.checked)
		.map(f => ({
			id: f.id,
			product_group_id: f.group_id,
			feature_id: f.feature_id,
			order: f.order,
			type: f.filterType,
		})),
);

let isClicked = false;

const { create } = useCreateOrUpdate(catalogFiltersService, errorNames(), '/dashboard/catalog-filters/');
const { validate, errors, removeError } = useValidationHandler();

const saveOrUpdate = async () => {
	isClicked = true;
	//if (validate(isClicked, sendData.value)) {
		if (!sendData.value.length) {
			await catalogFiltersService.remove(localization, productType.value.id, errMsg => toaster.error(toast, errMsg));
		}
		const response = await create(sendData.value);
	//}
};

const getOnlyActiveFilters = (arr) => {
	return arr.filter(item => item.checked === true);
}

const getOnlyParameters = (arr) => {
	return arr.filter(item => item.checked !== true);
}

const updateFilters = async (feature) => {
	if (feature.checked) {
		feature.order = getOnlyActiveFilters(features.value).length + 1;
		features.value.sortAscendantByField('order');
	}

	await nextTick();
	setSelectValues();
}

const setSelectValues = () => {
	const parentSelects = document.getElementsByClassName("select_pos_filters");
	for (let i = 0; i < parentSelects.length; i++) {
		parentSelects[i].selectedIndex = i;
	}
}

const updateOrderFilters = async (feature_item, event, pos) => {
	if (canEdit.value) {
		const totalItems = getOnlyActiveFilters(features.value).length;
		const tempArr    = getOnlyActiveFilters(features.value).filter(feature => feature.id !== feature_item.id);
		
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
	
		tempArr.forEach((item, index) => (item.order = (index + 1).toString()));
		
		features.value = tempArr.concat(getOnlyParameters(features.value));
		features.value.sort((prev, next) => prev.order - next.order);
	}
};
</script>

<style>
.dug_filter {
    width: 8%;
    text-align: center;
}
</style>
