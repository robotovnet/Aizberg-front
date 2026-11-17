<template>
	<div class="modal" :class="activeCls">
		<div class="modal__wrapper modal__wrapper--long">
			<div class="modal__top">
				<h2 class="modal__title">{{ $t('text.client_card') }}</h2>
			</div>
			<div class="modal__content">
				<div class="modal__inner modal__inner--in-two">
					<span>{{ $t('text.client_type') }}</span>
					<select class="modal__select select" v-model="clientTypeId" :disabled="client?.deleted_at != null">
						<option :value="clientType.id" v-for="clientType in clientTypes">{{ clientType.name }}</option>
					</select>
				</div>
				<div class="modal__inner modal__inner--in-two">
					<span>
						<label>
						{{ $t('text.fixed_client_type') }}
						<input 
							type="checkbox" 
							v-model="permanentType" 
							:disabled="client?.deleted_at != null"
							class="modal__checkbox"
							style="margin-top: 0px; margin-left: 4px; vertical-align: text-top;"
						>
						</label>
					</span>
				</div>
				<pre></pre>
				<div class="modal__inner modal__inner--in-two">
					<span>{{ $t('text.client_manager') }}</span>
					<select class="modal__select select" v-model="managerId" :disabled="client?.deleted_at != null">
						<option :value="staff.id" v-for="staff in staffs">{{ staff.first_name }} {{ staff.last_name }}</option>
					</select>
				</div>
				<div class="modal__inner modal__inner--in-two">
					<span>{{ $t('text.first_last_name') }}</span>
					<span>{{ client?.last_name }} {{ client?.first_name }}</span>
				</div>
				<div class="modal__inner modal__inner--in-two">
					<span>{{ $t('text.email') }}</span>
					<a target="blank" :href="`mailto: ${client?.email}`">{{ client?.email }}</a>
				</div>
				<div class="modal__inner modal__inner--in-two">
					<span>{{ $t('text.phone') }}</span>
					<span>{{ client?.phone }}</span>
				</div>
				<div class="modal__inner modal__inner--in-two">
					<span>{{ $t('text.country_city') }}</span>
					<span
						>{{ Array.isArray(client?.city) ? client?.city[0]?.name : client?.city?.name }},
						{{ Array.isArray(client?.country) ? client?.country[0]?.name : client?.country?.name }}</span
					>
				</div>
				<div class="modal__inner modal__inner--in-two">
					<span>{{ $t('text.reg_date') }}</span>
					<span>{{ client?.created_at }}</span>
				</div>
				<div class="modal__inner modal__inner--center" v-if='client?.deleted_at == null'>
					<button class="btn" @click="update">{{ $t('text.save_changes') }}</button>
				</div>
				<p v-else style='font-size: 16px; text-align: center; width: 100%; margin-top: 40px; color: brown;'>Клиент был удален</p>
			</div>

			<button class="modal__close" @click="$emit('close')" :title="$t('text.save_changes')">{{ $t('text.save_changes') }}</button>
		</div>
	</div>
	<div class="modal-overlay" @click.self="$emit('close')" :class="overlayCls"></div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import useValidationHandler from '../../../../composables/pages/dashboard/useValidationHandler';

// eslint-disable-next-line no-undef
const emit = defineEmits(['close', 'update']);
const props = defineProps<{
	isVisible;
	client;
	clientTypes;
	staffs;
}>();

const { isVisible, client, clientTypes, staffs } = toRefs(props);

const sendData = computed(() => ({
	id: client.value.id,
	first_name: client.value.first_name,
	last_name: client.value.last_name,
	email: client.value.email,
	phone: client.value.phone,
	country_code: Array.isArray(client.value?.country) ? client.value?.country[0]?.code : 'ru',
	city_id: client.value.city[0]?.id || 1,
	staff_id: managerId.value,
	client_type_id: clientTypeId.value || clientTypes.value[0],
	permanent_type: permanentType.value ? 'Y' : 'N',
}));

const { validate, errors, removeError } = useValidationHandler();
const isClicked = false;

const update = () => {
	console.log(sendData.value);
	emit('close');
	emit('update', sendData.value);
};

const activeCls = ref('');
const overlayCls = ref('');

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
const clientTypeId = ref();
const managerId = ref();
const permanentType = ref(false);
watch(
	() => isVisible.value,
	() => {
		if (client.value) {
			clientTypeId.value = client.value?.client_type[0]?.id || client.value?.client_type?.client_type_id;
			managerId.value = client.value?.staff[0]?.id || client.value.staff.id;
			permanentType.value = client.value?.permanent_type === 'Y';
			toggleDialog(isVisible.value);
		}
	},
);
</script>