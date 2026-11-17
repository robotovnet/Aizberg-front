<template>
	<div class="modal" :class="activeCls">
		<div class="modal__wrapper modal__wrapper--long">
			<div class="modal__content">
				<span class="modal__help"
					>{{ $t('text.shop') }}:
					{{ yml?.shop?.city.name }}
				</span>
				<div class="position-relative">
					<input
						type="text"
						class="input mb-25 width-100"
						@input="removeError(errors?.errors['shop_domain'])"
						v-model="yml.shop_domain"
						:placeholder="$t('text.shop_domain')" />
					<div v-if="errors?.errors?.shop_domain" class="yml-modal-error" v-html="errors?.errors['shop_domain']" />
				</div>

				<div class="position-relative">
					<input
						type="text"
						class="input mb-25 width-100"
						@input="removeError(errors?.errors['company_name'])"
						v-model="yml.company_name"
						:placeholder="$t('text.company_name')" />
					<div v-if="errors?.errors?.company_name" class="yml-modal-error" v-html="errors?.errors['company_name']" />
				</div>

				<div class="position-relative">
					<input
						type="text"
						class="input mb-25 width-100"
						@input="removeError(errors?.errors['shop_name'])"
						v-model="yml.shop_name"
						:placeholder="$t('text.yml_filename')" />
					<div v-if="errors?.errors?.shop_name" class="yml-modal-error" v-html="errors?.errors['shop_name']" />
				</div>
				<span class="modal__help">{{ $t('text.choose_remains') }}:</span>
				<div class="modal__inner modal__inner--wrap">
					<div class="modal-warehouses-wrapper">
						<div :key="warehouse.id" class="modal-warehouses-item" v-for="warehouse in mappedWarehouses">
							<label>
								<input type="checkbox" v-model="warehouse.checked" class="checkbox-group__checkbox" />
								<span>{{ warehouse.name }}</span>
							</label>
						</div>
					</div>
				</div>
				<div class="modal__inner modal__inner--center modal__inner--mt">
					<button class="btn" @click="update">
						{{ $t('text.save_changes') }}
					</button>
				</div>
				<button class="modal__close" @click="$emit('close')" :title="$t('text.close')">{{ $t('text.close') }}</button>
			</div>
			<div class="modal__top">
				<h2 class="modal__title">{{ $t('text.yml_edit') }}</h2>
			</div>
		</div>
	</div>
	<div class="modal-overlay" @click.self="$emit('close')" :class="overlayCls"></div>
</template>

<script setup lang="ts">
import { defineProps, ref, toRefs, watch, getCurrentInstance } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import useValidationHandler from '../../../../composables/pages/dashboard/useValidationHandler';
import { nextTick } from 'process';

// eslint-disable-next-line no-undef
const emit = defineEmits(['close', 'update']);
const props = defineProps<{
	isVisible: Boolean;
	yml: any;
	warehouses: Array<any>;
}>();

const activeCls = ref('');
const overlayCls = ref('');

const { isVisible, yml, warehouses } = toRefs(props);

const mappedWarehouses = computed(() => {
	return warehouses.value?.map(warehouse => {
		return {
			id: warehouse.id,
			name: warehouse.name,
			checked: yml.value?.warehouses?.filter(wh => wh.id === warehouse.id).map(w => !!w)[0],
		};
	});
});
const sendData = computed(() => ({
	id: yml.value?.id,
	shop_id: yml.value?.shop_id,
	shop_name: yml.value?.shop_name,
	company_name: yml.value?.company_name,
	shop_domain: yml.value?.shop_domain,
	warehouses: mappedWarehouses?.value?.filter(warehouse => warehouse.checked).map(item => item.id),
}));

const { validate, errors, removeError } = useValidationHandler();
let isClicked = false;

const update = () => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		emit('close');
		emit('update', sendData.value);
	}
};

const toggleDialog = show => {
	if (show) {
		activeCls.value = 'modal--active';
		overlayCls.value = 'modal-overlay--active';
	} else {
		activeCls.value = '';
		overlayCls.value = '';
		emit('close');
	}
};

watch(
	() => isVisible.value,
	() => toggleDialog(isVisible.value),
);
const instance = getCurrentInstance();
</script>
