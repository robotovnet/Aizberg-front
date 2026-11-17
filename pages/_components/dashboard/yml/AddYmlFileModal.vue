<template>
	<div class="modal"
	     :class="activeCls">
		<div class="modal__wrapper modal__wrapper--long">
			<div class="modal__top mb-15">
				<h2 class="modal__title">{{ $t('text.new_yml') }}</h2>
			</div>
			<div class="yml-modal-content ">
				<div class="position-relative">
					<select class="yml-item select mb-25 width-100"
					        @change="removeError(errors?.errors.shop_id)"
					        v-model="shopId">
						<option value="0">{{ $t('text.shop') }}</option>
						<option :value="shop.id"
						        v-for="shop in shops">{{ shop?.city?.name }}
						</option>
					</select>
					<div v-if="errors?.errors?.shop_id" class="yml-modal-error"
					     v-html="errors?.errors?.shop_id"/>
				</div>
				
				<div class="position-relative">
					<input type="text"
					       class=" input mb-25  width-100"
					       @input="removeError(errors?.errors['shop_domain'])"
					       v-model="shopDomain"
					       :placeholder=" $t('text.shop_domain') ">
					<div v-if="errors?.errors?.shop_domain" class="yml-modal-error"
					     v-html="errors?.errors['shop_domain']"/>
				</div>
				
				<div class="position-relative">
					<input type="text"
					       class=" input mb-25  width-100"
					       @input="removeError(errors?.errors['company_name'])"
					       v-model="companyName"
					       :placeholder=" $t('text.company_name')">
					<div v-if="errors?.errors?.company_name" class="yml-modal-error"
					     v-html="errors?.errors['company_name']"/>
				</div>
				
				<div class="position-relative">
					<input type="text"
					       class=" input mb-25  width-100"
					       @input="removeError(errors?.errors['shop_name'])"
					       v-model="ymlName"
					       :placeholder=" $t('text.yml_filename') ">
					<div v-if="errors?.errors?.shop_name" class="yml-modal-error"
					     v-html="errors?.errors['shop_name']"/>
				</div>
				
				
				<span class="modal__help">{{ $t('text.choose_remains') }}:</span>
				<div class="modal__inner modal__inner--wrap">
					<div class="modal-warehouses-wrapper">
						<div class="modal-warehouses-item" v-for="warehouse in mappedWarehouses">
							<label>
								<input type="checkbox"
								       v-model="warehouse.checked"
								       class="checkbox-group__checkbox">
								<span>{{ warehouse.name }}</span>
							</label>
						</div>
					</div>
				</div>
				
				<div class="modal__inner modal__inner--center mb-25">
					<button class="btn"
					        @click="save">{{ $t('text.save_add') }}
					</button>
				</div>
				<button @click="toggleDialog(false)"
				        class="modal__close"
				        :title="$t('text.close')">{{ $t('text.close') }}
				</button>
			</div>
		</div>
	</div>
	<div class="modal-overlay"
	     @click.self="$emit('close')"
	     :class="overlayCls"></div>
</template>

<script setup lang="ts">
import {
	defineProps, ref, toRefs, watch,
} from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import useValidationHandler from '../../../../composables/pages/dashboard/useValidationHandler';

const emit = defineEmits(['close', 'save']);
const props = defineProps<{
	isVisible: Boolean,
	shops: Array<any>,
	warehouses: Array<any>,
}>();

const {
	isVisible,
	shops,
	warehouses,
} = toRefs(props);

const shopId = ref<any>(0);
const ymlName = ref<any>();
const shopDomain = ref<any>();
const companyName = ref<any>();

const sendData = computed(() => ({
	shop_name: ymlName.value,
	company_name: companyName.value,
	shop_domain: shopDomain.value,
	shop_id: shopId.value,
	warehouses: mappedWarehouses.value.filter(warehouse => warehouse.checked)
		.map(item => item.id)
}));
const mappedWarehouses = computed(() => {
	return warehouses.value?.map(warehouse => {
		return {
			id: warehouse.id,
			name: warehouse.name,
			checked: false
		};
	});
});

const {
	validate,
	errors,
	removeError,
} = useValidationHandler();
let isClicked = false;

const save = () => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		emit('close');
		emit('save', sendData.value);
	}
};

const activeCls = ref('');
const overlayCls = ref('');

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
