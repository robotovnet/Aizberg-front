<template>
	<div class="modal"
	     :class="activeCls">
		<div class="modal__wrapper">
			<div class="modal__top">
				<h2 class="modal__title">{{ $t('text.copy_to_analog') }}</h2>

			</div>
			<div class="modal__content">
				<label class="checkbox-group">
					<input type="checkbox"
					       class="checkbox-group__checkbox"
					       v-model="desc">
					<span>{{ $t('text.product_description') }}</span>
				</label>
				<label class="checkbox-group">
					<input type="checkbox"
					       class="checkbox-group__checkbox"
					       v-model="brand">
					<span>{{ $t('text.modal_brand') }}</span>
				</label>
				<label class="checkbox-group">
					<input type="checkbox"
					       class="checkbox-group__checkbox"
					       v-model="relatedProducts">
					<span>{{ $t('text.list_of_related_products') }}</span>
				</label>
				<label class="checkbox-group">
					<input type="checkbox"
					       class="checkbox-group__checkbox"
					       v-model="features">
					<span>{{ $t('text.all_parameters') }}</span>
				</label>
				<label class="checkbox-group">
					<input type="checkbox"
					       class="checkbox-group__checkbox"
					       v-model="altNames">
					<span>{{ $t('text.alternative_name') }}</span>
				</label>
				<label class="checkbox-group">
					<input type="checkbox"
					       class="checkbox-group__checkbox"
					       v-model="pn">
					<span>{{ $t('text.pn') }}</span>
				</label>
				<div class="modal__inner modal__inner--full">
					<label class="checkbox-group">
						<input type="checkbox"
						       class="checkbox-group__checkbox"
						       v-model="selectAllSelector">
						<span>{{ $t('text.select_all') }}</span>
					</label>
					<button class="btn"
					        @click="emitFormData">{{ $t('text.copy') }}
					</button>
				</div>
				<button class="modal__close"
				        @click="onClose">Close
				</button>
			</div>
		</div>
	</div>
	<div class="modal-overlay"
	     :class="overlayCls"></div>
</template>

<script setup lang="ts">

import {
	ref, watch, defineProps, defineEmits, toRefs,
} from 'vue';
import { computed } from '@vue/runtime-core';

const emit = defineEmits(['emitFormData', 'closeModal']);

const activeCls = ref('modal--active');
const overlayCls = ref('modal-overlay--active');
const selectAllSelector = ref(false);
const desc = ref(false);
const relatedProducts = ref(false);
const brand = ref(false);
const features = ref(false);
const pn = ref(false);
const altNames = ref(false);
const formData = computed(() => ({
	desc: desc.value ? 'Y' : 'N',
	related_products: relatedProducts.value ? 'Y' : 'N',
	brand: brand.value ? 'Y' : 'N',
	features: features.value ? 'Y' : 'N',
	pn: pn.value ? 'Y' : 'N',
	alt_names: altNames.value ? 'Y' : 'N',
}));

const toggleDialog = (selector) => {
	if (selector) {
		activeCls.value = 'modal--active';
		overlayCls.value = 'modal-overlay--active';
	} else {
		activeCls.value = '';
		overlayCls.value = '';
	}
};

const selectAll = () => {
	if (selectAllSelector.value) {
		desc.value = true;
		relatedProducts.value = true;
		brand.value = true;
		features.value = true;
		pn.value = true;
		altNames.value = true;
	} else {
		desc.value = false;
		relatedProducts.value = false;
		brand.value = false;
		features.value = false;
		pn.value = false;
		altNames.value = false;
	}
};

watch(() => selectAllSelector.value, () => {
	selectAll();
});
const emitFormData = () => {
	emit('emitFormData', formData.value);
	emit('closeModal');
};
const onClose = () => {
	emit('closeModal');
};
</script>
