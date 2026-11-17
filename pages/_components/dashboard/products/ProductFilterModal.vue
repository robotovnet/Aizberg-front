<template>
	<div class="modal"
	     :class="activeCls">
		<div class="modal__wrapper modal__wrapper--sm">
			<div class="modal__sort">
				{{ $t('text.sort_by') }}:
				<a href="#"
				   class="modal__sort-item"
				   @click="sortBySortItem(item)"
				   :class="{'active': item.isActive}"
				   v-for="item in sortingItemsList">{{ item.name }}</a>
			</div>
			<div class="modal__inner modal__inner--wrap">
				<div class="modal__column">
					<label class="checkbox-group">
						<input type="checkbox"
						       v-model="analogs"
						       @change="filter"
						       class="checkbox-group__checkbox">
						<span>{{ $t('text.without_analogues') }} </span>
					</label>
					<label class="checkbox-group">
						<input type="checkbox"
						       v-model="relatedProducts"
						       @change="filter"
						       class="checkbox-group__checkbox">
						<span>{{ $t('text.without_accompanying') }} </span>
					</label>
					<label class="checkbox-group">
						<input type="checkbox"
						       v-model="prices"
						       @change="filter"
						       class="checkbox-group__checkbox">
						<span>{{ $t('text.without_prices') }} </span>
					</label>
					<label class="checkbox-group">
						<input type="checkbox"
						       v-model="photos"
						       @change="filter"
						       class="checkbox-group__checkbox">
						<span>{{ $t('text.without_photos') }} </span>
					</label>
					<label class="checkbox-group">
						<input type="checkbox"
						       v-model="parameters"
						       @change="filter"
						       class="checkbox-group__checkbox">
						<span>{{ $t('text.without_parameters') }} </span>
					</label>
					<label class="checkbox-group">
						<input type="checkbox"
						       v-model="hidden"
						       @change="filter"
						       class="checkbox-group__checkbox">
						<span>{{ $t('text.hidden_products') }} </span>
					</label>
				</div>
				<div class="modal__column">
					<label class="checkbox-group">
						<input type="checkbox"
						       v-model="statusInStock"
						       @change="filter"
						       class="checkbox-group__checkbox">
						<span>{{ $t('text.in_stock') }} </span>
					</label>
					<label class="checkbox-group">
						<input type="checkbox"
						       v-model="statusOutOfStock"
						       @change="filter"
						       class="checkbox-group__checkbox">
						<span>{{ $t('text.ended') }}</span>
					</label>
					<label class="checkbox-group">
						<input type="checkbox"
						       v-model="statusPreOrder"
						       @change="filter"
						       class="checkbox-group__checkbox">
						<span>{{ $t('text.under_the_order') }} </span>
					</label>
					<select class="select"
					        @change="filter"
					        v-model="productTypeId">
						<option :value="0"

						        selected>{{ $t('text.product_type') }}
						</option>
						<option :value="productType.id"
						        v-for="productType in productTypes"
						        selected>{{ productType.plural_name }}
						</option>
					</select>
					<select class="select"
					        @change="filter"
					        v-model="brandId">
						<option :value="0"

						        selected>{{ $t('text.brand') }}
						</option>
						<option :value="brand.id"
						        v-for="brand in brands"
						        selected>{{ brand.name }}
						</option>
					</select>

				</div>
			</div>
			<div class="modal__sort">
				{{ $t('text.look_at') }}:
				<a href="#"
				   @click="setItemsQuantity(quantity)"
				   v-for="quantity in quantityList"
				   class="modal__sort-item"
				   :class="{'active': quantity.isActive}">
					{{ quantity.title }}
				</a>
			</div>
			<h3 class="modal__title">{{ $t('text.filters') }}</h3>
			<button class="modal__close"
			        @click="$emit('close')"
			        :title="$t('text.close')">{{ $t('text.close') }}
			</button>
		</div>
	</div>
	<div class="modal-overlay"
	     @click.self="$emit('close')"
	     :class="overlayCls"></div>
</template>

<script setup lang="ts">
import {
	defineProps, inject, ref, toRefs, watch, defineEmits,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { computed } from '@vue/runtime-core';

const toast = inject('toast') as any;
const localization: any = useI18n();
const emit = defineEmits(['close', 'sort', 'quantity']);
const props = defineProps<{
	isVisible: boolean,
	productTypes: any,
	brands: any,
}>();
const activeCls = ref('');
const overlayCls = ref('');
const {
	isVisible,
	productTypes,
	brands,
} = toRefs(props);

const sortingItemsList = ref<any>([
	{
		isActive: true,
		name: localization.t('text.novelty'),
		value: 'by_novelty',
	},
	{
		isActive: false,
		name: localization.t('text.alphabet'),
		value: 'by_name',
	},
	{
		isActive: false,
		name: localization.t('text.availability'),
		value: 'by_availability',
	},
	{
		isActive: false,
		name: localization.t('text.price'),
		value: 'by_price',
	},
	{
		isActive: false,
		name: localization.t('text.views'),
		value: 'by_views',
	},
]);
const sortingItem = ref('by_novelty');

const quantityList = ref([
	{
		isActive: true,
		title: 50,
		value: 50,
	},
	{
		isActive: false,
		title: 100,
		value: 100,
	},
	{
		isActive: false,
		title: 200,
		value: 200,
	},
	{
		isActive: false,
		title: 1000,
		value: 1000,
	},
]);
const quantity = ref(50);

const productTypeId = ref(0);
const brandId = ref(0);
const analogs = ref(false);
const relatedProducts = ref(false);
const statusInStock = ref(false);
const statusOutOfStock = ref(false);
const statusPreOrder = ref(false);	
const prices = ref(false);
const photos = ref(false);
const parameters = ref(false);
const hidden = ref(false);

const sortItemString = computed(() => `sorting=${sortingItem.value}`);
const typeString = computed(() => (productTypeId.value ? `&filters[product_group]=${productTypeId.value}` : ''));
const brandString = computed(() => (brandId.value ? `&filters[brand]=${brandId.value}` : ''));
const analogsString = computed(() => (analogs.value ? '&filters[without_similar]=Y' : ''));
const relatedProductsString = computed(() => (relatedProducts.value ? '&filters[without_related]=Y' : ''));
const statusInStockString = computed(() => (statusInStock.value ? `&filters[stock_status]=in_stock` : ''));
const statusOutOfStockString = computed(() => (statusOutOfStock.value ? `&filters[stock_status]=out_of_stock` : ''));
const statusPreOrderString = computed(() => (statusPreOrder.value ? `&filters[stock_status]=pre_order` : ''));
const pricesString = computed(() => (prices.value ? '&filters[without_prices]=Y' : ''));
const photosString = computed(() => (photos.value ? '&filters[without_photos]=Y' : ''));
const parametersString = computed(() => (parameters.value ? '&filters[without_features]=Y' : ''));
const hiddenString = computed(() => (hidden.value ? '&filters[hidden]=Y' : '&filters[hidden]=N'));

const itemsQuantity = computed(() => `&onPage=${quantity.value}`);

const queryString = computed(() => sortItemString.value
	+ typeString.value
	+ brandString.value
	+ analogsString.value
	+ itemsQuantity.value
	+ relatedProductsString.value
	+ statusInStockString.value
	+ statusOutOfStockString.value
	+ statusPreOrderString.value
	+ pricesString.value
	+ photosString.value
	+ parametersString.value
	+ hiddenString.value);

const filterString = computed(() => (typeString.value
	+ brandString.value
	+ analogsString.value
	+ relatedProductsString.value
	+ statusInStockString.value
	+ statusOutOfStockString.value
	+ statusPreOrderString.value		     
	+ pricesString.value
	+ photosString.value
	+ parametersString.value
	+ hiddenString.value).substr(1));

const setItemsQuantity = (q) => {
	quantityList.value.forEach(item => {
		item.isActive = (q.value === item.value);
	});
	quantity.value = q.value;
	emit('sort', queryString.value, filterString.value);
	emit('quantity', q.value);
};

const filter = () => {
	emit('sort', queryString.value, filterString.value);
};

const sortBySortItem = (sortItem) => {
	sortingItemsList.value.forEach(item => {
		item.isActive = (sortItem.value === item.value);
	});
	sortingItem.value = sortItem.value;
	emit('sort', queryString.value, filterString.value);
};

const toggleDialog = (show) => {
	if (show) {
		activeCls.value = 'modal--active';
		overlayCls.value = 'modal-overlay--active';
	} else {
		activeCls.value = '';
		overlayCls.value = '';
		emit('close');
	}
};

watch(() => isVisible.value, () => toggleDialog(isVisible.value));

</script>
