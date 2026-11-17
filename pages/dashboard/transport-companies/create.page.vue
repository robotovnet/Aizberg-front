<template>
	<AppPage :title="$t('text.header_create')" :can-edit="canEdit" v-if="canEdit">
		<div class="main__sub"></div>
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.transport_company_name') }}</span>
				<input
					v-model="company.names"
					type="text"
					class="main__input input"
					:placeholder="$t('text.transport_company_name_placeholder')"
					@input="removeError(errors?.errors['names.0.value'])" />
				<span
					class="main__error main__error-message"
					v-if="errors?.errors['names.0.value']"
					v-html="errors?.errors['names.0.value']" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.transport_company_comment') }}</span>
				<input
					v-model="company.additional_comments"
					type="text"
					class="main__input input"
					:placeholder="$t('text.transport_company_comment_placeholder')"
					@input="removeError(errors?.errors?.additional_comments)" />
				<span class="main__error main__error-message" v-html="errors?.errors?.additional_comments" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.transport_company_1c') }}</span>
				<input
					v-model="company.code"
					type="text"
					class="main__input input"
					placeholder="CODE"
					@input="removeError(errors?.errors?.code)" />
				<span class="main__error main__error-message" v-html="errors?.errors?.code" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.transport_company_min_sum_courier') }}</span>
				<input
					v-model="company.minimum_order_value_courier"
					type="text"
					class="main__input input"
					placeholder="0"
					@input="removeError(errors?.errors?.minimum_order_value_courier)" />
				<span class="main__error main__error-message" v-html="errors?.errors?.minimum_order_value_courier" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.transport_company_min_sum_pickup') }}</span>
				<input
					v-model="company.minimum_order_value_pickup"
					type="text"
					class="main__input input"
					placeholder="0"
					@input="removeError(errors?.errors?.minimum_order_value_pickup)" />
				<span class="main__error main__error-message" v-html="errors?.errors?.minimum_order_value_pickup" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.transport_company_order_period') }}</span>
				<div class="main__block">
					<div class="main__group">
						<div class="main__help">{{ $t('text.transport_company_order_period_from') }}</div>

						<input
							type="text"
							v-model="company.accept_orders_start_time"
							class="main__input main__input--sm input"
							placeholder="00:00"
							ref="start_time"
							id="start"
							@input="removeError(errors?.errors?.accept_orders_start_time)" />
						<div class="main__help">{{ $t('text.transport_company_order_period_to') }}</div>

						<input
							type="text"
							v-model="company.accept_orders_completion_time"
							class="main__input main__input--sm input"
							placeholder="23:59"
							ref="end_time"
							@input="removeError(errors?.errors?.accept_orders_completion_time)" />
					</div>
				</div>
			</div>
			<div class="period-errors">
				<div v-for="(error, idx) in errors?.errors?.accept_orders_start_time" class="" v-html="error" :key="idx"></div>
				<div v-for="(error, idx) in errors?.errors?.accept_orders_completion_time" class="" v-html="error" :key="idx"></div>
			</div>
			<div class="main__inner main__inner--short main__inner--top">
				<span class="main__text">{{ $t('text.transport_company_shipping_methods') }}</span>
				<div class="main__block">
					<div class="main__checkboxes">
						<label class="checkbox-group">
							<input
								type="checkbox"
								id="status-12"
								v-model="company.is_support_courier_delivery"
								class="checkbox-group__checkbox" />
							<span>{{ $t('text.transport_company_courier') }}</span>
						</label>
						<label class="checkbox-group">
							<input
								type="checkbox"
								v-model="company.is_support_pickup_points"
								id="status-123"
								class="checkbox-group__checkbox" />
							<span>{{ $t('text.transport_company_pick_up_points') }}</span>
						</label>
						<label class="checkbox-group">
							<input
								type="checkbox"
								v-model="company.is_support_postamats"
								id="status-1234"
								class="checkbox-group__checkbox" />
							<span>{{ $t('text.transport_company_postomats') }}</span>
						</label>
					</div>
				</div>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.transport_company_tc_icon') }}</span>
				<label for="avatar-upload" class="avatar avatar--long">
					<input type="file" @change="imageInput($event)" id="avatar-upload" class="avatar__input" />
					<div class="avatar__img">
						<img :src="previewImage ? previewImage : company.icon_path ? imgPath + company.icon_path : defaultImg" alt="" />
					</div>
					<span class="avatar__btn btn">{{ $t('text.transport_company_choose_icon') }}</span>
				</label>
			</div>
			<div class="main__inner main__inner--end main__inner--margin">
				<label for="type-checkbox" class="checkbox-group">
					<span>{{ $t('text.transport_company_activate') }}</span>
					<input type="checkbox" v-model="company.is_active" id="type-checkbox" class="checkbox-group__checkbox" />
				</label>
			</div>
			<div class="main__inner main__inner--end">
				<button class="btn" @click="save">{{ $t('text.transport_company_add') }}</button>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, onBeforeMount, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { onMounted } from '@vue/runtime-core';
import IMask from 'imask';
import { MainState } from '../../../store/mainStore';
import getValidator from '../../../validation/getValidator';
import transportCompaniesService from '../../../services/transportCompaniesService';
import { IMG_PATH, DEFAULT_PIC } from '../../../utils/constants';
import imageService from '../../../services/imageService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import toaster from '../../../utils/toaster';
import viewPermissions from '../../../utils/viewPermissions';
import timeMask from '../../../utils/timeMaskRules';
import sleep from '../../../utils/sleep';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization = useI18n();
const store = useStore<MainState>();
const imgPath = ref(IMG_PATH);
const defaultImg = ref(DEFAULT_PIC);

let company = ref({
	accept_orders_completion_time: '',
	accept_orders_start_time: '',
	code: '',
	icon_path: null,
	is_active: false,
	is_support_courier_delivery: false,
	is_support_pickup_points: false,
	is_support_postamats: false,
	minimum_order_value_courier: '0',
	minimum_order_value_pickup: '0',
	names: '',
	additional_comments: '',
});

const sendData = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: company.value.names,
		},
	],
	additional_comments: [
		{
			lang: localization.locale.value,
			value: company.value.additional_comments,
		},
	],
	code: company.value.code,
	accept_orders_start_time: company.value.accept_orders_start_time,
	accept_orders_completion_time: company.value.accept_orders_completion_time,
	minimum_order_value_courier: company.value.minimum_order_value_courier,
	minimum_order_value_pickup: company.value.minimum_order_value_pickup,
	is_support_courier_delivery: company.value.is_support_courier_delivery ? 'Y' : 'N',
	is_support_postamats: company.value.is_support_postamats ? 'Y' : 'N',
	is_support_pickup_points: company.value.is_support_pickup_points ? 'Y' : 'N',
	is_active: company.value.is_active ? 'Y' : 'N',
}));
const isClicked = ref(false);

const { validate, errors, removeError } = useValidationHandler(store.state.currentValidation?.createOrUpdateTransportCompany);
const previewImage: any = ref('');
let imageData: any = null;
const imageInput = (e: any) => {
	const image = e.target.files[0];
	const reader = new FileReader();
	reader.readAsDataURL(image);
	reader.onload = e => {
		previewImage.value = e.target?.result;
	};
	const formData = new FormData();
	formData.append('icon', image);
	imageData = formData;
};

const saveIcon = async response => {
	let isNoError = true;
	if (imageData !== null) {
		await imageService.saveTransportCompanyIcon(localization, response.transport_company_id, imageData, errMsg => {
			toaster.error(toast, errMsg);
			isNoError = false;
			store.commit('setLoading', false);
		});
		return true;
	}
	return false;
};
const errorNames = [
	'accept_orders_completion_time',
	'accept_orders_start_time',
	'additional_comments',
	'code',
	'is_active',
	'is_support_courier_delivery',
	'is_support_pickup_points',
	'is_support_postamats',
	'minimum_order_value_courier',
	'minimum_order_value_pickup',
	'names.0.value',
];
const { canEdit, canView } = usePageInit('transportcompany');
const save = async () => {
	isClicked.value = true;

	validate(isClicked.value, sendData.value);

	if (validate(isClicked.value, sendData.value)) {
		store.commit('setLoading', true);
		const response = await transportCompaniesService.create(localization, sendData.value, errorNames, (errMsg, _, type) => {
			errors.value = {
				errors: {
					...errors.value?.errors,
					[type as any]: [errMsg],
				},
			};
			store.commit('setLoading', false);
		});
		let success;
		if (response.message === 'success') {
			success = await saveIcon(response);
		} else {
			return;
		}
		toaster.success(toast, localization.t('text.generalSuccessCreated'));
		window.location.replace('/dashboard/transport-companies');
		store.commit('setLoading', false);
	}
};

const start_time = <any>ref();
const end_time = <any>ref();

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard/transport-companies');
	store.commit('setLoading', true);
	await sleep(1);
	store.commit('setLoading', false);
	IMask(start_time.value, timeMask);
	IMask(end_time.value, timeMask);
	useValidationHandler(store.state.currentValidation?.createOrUpdateTransportCompany);
});

onMounted(() => {
	document.title += ` - ${localization.t('text.header_create')}`;
});
</script>
