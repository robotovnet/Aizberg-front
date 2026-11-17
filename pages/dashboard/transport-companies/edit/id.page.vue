<template>
	<AppPage :title="$t('text.header_edit')" v-if="canEdit">
		<div class="main__sub"></div>
		<div class="main__content" v-if="company">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.transport_company_name') }}</span>
				<input
					v-model="company.name"
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
					v-model="company.additional_comment"
					type="text"
					class="main__input input"
					:placeholder="$t('text.transport_company_comment_placeholder')"
					@input="removeError(errors?.errors?.additional_comment)" />
				<span class="main__error main__error-message" v-html="errors?.errors?.additional_comment" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.transport_company_1c') }}</span>
				<input
					v-model="company.code"
					type="text"
					class="main__input input"
					placeholder="CODE"
					@input="removeError(errors?.errors?.code)" />
				<span class="main__error main__error-mes sage" v-html="errors?.errors?.code" />
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
			<!-- Период приема заказов -->
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.transport_company_order_period') }}</span>
				<div class="main__block">
					<div class="main__group">
						<div class="main__help">{{ $t('text.transport_company_order_period_from') }}</div>
						<input
							type="time"
							v-model="company.accept_orders_start_time"
							class="main__input main__input--sm input"
							placeholder="00:00"
							@validate="validate"
							ref="start_time" />
						<div class="main__help">{{ $t('text.transport_company_order_period_to') }}</div>

						<input
							type="time"
							v-model="company.accept_orders_completion_time"
							class="main__input main__input--sm input"
							placeholder="23:59"
							@validate="validate"
							ref="end_time" />
					</div>
				</div>
			</div>
			<div class="period-errors">
				<div v-for="(error, idx) in errors?.errors?.accept_orders_start_time" class="" v-html="error" :key="idx"></div>
				<div v-for="(error, idx) in errors?.errors?.accept_orders_completion_time" class="" v-html="error" :key="idx"></div>
			</div>

			<div class="main__inner main__inner--short main__inner--top">
				<span class="main__text">{{ $t('text.transport_company_shipping_methods') }}</span>
				<!-- Способы доставки -->
				<div class="main__block">
					<div class="main__column main__column--ultra main__column--custom">
						<!-- Курьерская доставка -->
						<div class="main__group">
							<label class="checkbox-group">
								<input
									type="checkbox"
									id="status-12"
									v-model="company.is_support_courier_delivery"
									class="checkbox-group__checkbox" />
								<span>{{ $t('text.transport_company_courier') }}</span>
							</label>
							<div class="main__group">
								<a href="#" @click="goToCityList" class="link modal-btn">{{ $t('text.transport_company_city_list') }}</a>
								<a @click="openCourierSettings" href="#" class="link"
									>{{ $t('text.transport_company_delivery_settings') }}
								</a>
							</div>
						</div>
						<!-- ПВЗ Самовывоз -->
						<div class="main__group">
							<label class="checkbox-group">
								<input
									type="checkbox"
									v-model="company.is_support_pickup_points"
									id="status-123"
									class="checkbox-group__checkbox" />
								<span>{{ $t('text.transport_company_pick_up_points') }}</span>
							</label>
							<div class="main__group">
								<a href="#" @click="goToPickupPointsList" class="link">{{ $t('text.transport_company_pick_up_list') }}</a>
								<a href="#" @click="openPickupPointsSettings" class="link modal-btn"
									>{{ $t('text.transport_company_delivery_settings') }}
								</a>
							</div>
						</div>
						<!-- Постаматы -->
						<div class="main__group">
							<label class="checkbox-group">
								<input
									type="checkbox"
									v-model="company.is_support_postamats"
									id="status-1234"
									class="checkbox-group__checkbox" />
								<span>{{ $t('text.transport_company_postomats') }}</span>
							</label>
							<div class="main__group">
								<a href="#" @click="goToPostamatsList" class="link modal-btn">{{
									$t('text.transport_company_postmats_list')
								}}</a>
								<a @click="openPostamatsSettings" href="#" class="link"
									>{{ $t('text.transport_company_delivery_settings') }}
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- Аватарка -->
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.transport_company_tc_icon') }}</span>
				<label for="avatar-upload" class="avatar avatar--long">
					<input type="file" id="avatar-upload" @change="imageInput($event)" class="avatar__input" />
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
			<div class="main__inner main__inner--end main__inner--margin">
				<a href="#" @click.prevent="openShippingRates" class="link">{{ $t('text.transport_company_manage_shipping_cost') }}</a>
			</div>
			<div class="main__inner main__inner--end">
				<button class="btn" @click="update">{{ $t('text.transport_company_edit') }}</button>
			</div>
		</div>
		<AppOrderTransferSettings
			v-if="renderComponent"
			:validation="validation"
			:errors="errors"
			:show="isTransferSettingsVisible"
			:title="popupTitle"
			:deliverySettings="deliverySettings"
			:deliveryType="deliveryType"
			:companyId="companyId"
			:settingsOne="settingsOne"
			:settingsTwo="settingsTwo"
			@closePopup="toggleTransferSettingsPopup"
			@updateSettings="updateTransferSettings"></AppOrderTransferSettings>
		<AppShippingRatesModal
			:show="isShippingRatesModalVisible"
			:companyId="company.id"
			:shippingCostId="shippingCostIdFirst"
			@closePopup="toggleShippingRatesModal"
			@saved="onShippingRatesSaved" />
		<pre></pre>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, computed, nextTick, defineComponent, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { onMounted } from '@vue/runtime-core';
import IMask from 'imask';
import axios from 'axios';
import { MainState } from '../../../../store/mainStore';
import { DEFAULT_PIC, IMG_TC_PATH } from '../../../../utils/constants';
import imageService from '../../../../services/imageService';
import AppPageInput from '../../../_components/AppPageInput.vue';
import transportCompaniesService from '../../../../services/transportCompaniesService';
import toaster from '../../../../utils/toaster';
import viewPermissions from '../../../../utils/viewPermissions';
import AppOrderTransferSettings from '../../../_components/dashboard/transport-companies/AppOrderTransferSettings.vue';
import AppShippingRatesModal from '../../../_components/dashboard/transport-companies/AppShippingRatesModal.vue';
import usePageInit from '../../../../composables/pages/dashboard/usePageInit';
import timeMask from '../../../../utils/timeMaskRules';
import useValidationHandler from '../../../../composables/pages/dashboard/useValidationHandler';
import getValidator from '../../../../validation/getValidator';
import fetchApi from '../../../../network/fetchEndpoint';
import sleep from '../../../../utils/sleep';
import redirect from '../../../../utils/redirect';
const props = defineProps({
	companyId: {
		type: String,
		default: 0,
		required: true,
	},
});

const renderComponent = ref(true);
const forceRerender = async () => {
	renderComponent.value = false;
	await nextTick();
	renderComponent.value = true;
};
const toast = inject('toast') as any;
const localization = useI18n();
const store = useStore<MainState>();
const settingsOne = ref();
const settingsTwo = ref();

const disabled = ref(true);
const imgPath = ref(IMG_TC_PATH);
const defaultImg = ref(DEFAULT_PIC);
const popupTitle = ref();
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
const company = ref({
	id: '',
	name: '',
	additional_comment: '',
	code: '',
	accept_orders_start_time: '',
	accept_orders_completion_time: '',
	minimum_order_value_courier: '',
	minimum_order_value_pickup: '',
	is_support_courier_delivery: true,
	is_support_postamats: true,
	is_support_pickup_points: true,
	is_active: '',
	delivery_settings: [],
	shipping_cost_ids: [] as number[],
}) as any;
const { validate, errors, removeError } = useValidationHandler();
const saveIcon = async companyId => {
	if (imageData !== null) {
		store.commit('setLoading', true);
		await imageService.saveTransportCompanyIcon(localization, companyId, imageData, errMsg => {
			toaster.error(toast, errMsg);
			store.commit('setLoading', false);
		});
		store.commit('setLoading', false);
		return true;
	}
};

const previewImage: any = ref('');
let imageData: any = null;
const imageInput = async (e: any) => {
	const image = e.target.files[0];
	const reader = new FileReader();
	reader.readAsDataURL(image);
	reader.onload = e => {
		previewImage.value = e.target?.result;
	};
	const formData = new FormData();
	formData.append('icon', image);
	imageData = formData;
	await saveIcon(company.value.id);
};
const { canEdit, canView } = usePageInit('transportcompany');
const sendData = computed(() => ({
	names: [{ lang: localization.locale.value, value: company.value.name }],
	additional_comments: [{ lang: localization.locale.value, value: company.value.additional_comment }],
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
let isClicked = false;
// UPDATE TRANSPORT COMPANY
const update = async () => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		store.commit('setLoading', true);
		const response = await transportCompaniesService.update(
			localization,
			props.companyId,
			sendData.value,
			errorNames,
			(errMsg, _, type) => {
				errors.value = { errors: { ...errors.value?.errors, [type as string]: [errMsg] } };
				store.commit('setLoading', false);
			},
		);
		if (response.message === 'success') {
			window.location.replace('/dashboard/transport-companies');
			toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		}
		store.commit('setLoading', false);
	}
};
// CREATE OR UPDATE TRANSFER SETTINGS
const settingsId = ref();
const validation = ref();
const updateTransferSettings = async settings => {
	if (settingsId.value) {
		const response = await transportCompaniesService.updateDeliverySettings(localization, settingsId.value, settings, errMsg =>
			toaster.error(toast, errMsg),
		);
		if (response.message === 'success') {
			toaster.success(toast, localization.t('text.generalSuccessUpdated'));
			toggleTransferSettingsPopup();
			await companyInit();
		}
	} else {
		const response = await transportCompaniesService.createDeliverySettings(localization, settings, errMsg =>
			toaster.error(toast, errMsg),
		);
		if (response.message === 'success') {
			toaster.success(toast, localization.t('text.generalSuccessUpdated'));
			toggleTransferSettingsPopup();
			await companyInit();
		}
	}
};

const isTransferSettingsVisible = ref(false);
const toggleTransferSettingsPopup = () => {
	isTransferSettingsVisible.value = !isTransferSettingsVisible.value;
};

watch(company.value, () => {
	if (
		company.value.additional_comment &&
		company.value.name &&
		company.value.code &&
		company.value.accept_orders_start_time &&
		company.value.accept_orders_completion_time
	) {
		disabled.value = false;
	}
});
const deliverySettings = ref();
const pickupPointsDeliverySettings = ref();
const couriersDeliverySettings = ref();
const postamatsDeliverySettings = ref();
const companyInit = async () => {
	store.commit('setLoading', true);
	const fetchedCompany = await transportCompaniesService.get(localization, props.companyId, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
	company.value.settings = fetchedCompany.settings;
	company.value.id = fetchedCompany.id;
	company.value.name = fetchedCompany.name;
	company.value.additional_comment = fetchedCompany.additional_comment;
	company.value.code = fetchedCompany.code;
	company.value.icon_path = fetchedCompany.icon_path;
	company.value.minimum_order_value_courier = fetchedCompany.minimum_order_value_courier ?? '';
	company.value.minimum_order_value_pickup = fetchedCompany.minimum_order_value_pickup ?? '';
	company.value.accept_orders_start_time = fetchedCompany.accept_orders_start_time;
	company.value.accept_orders_completion_time = fetchedCompany.accept_orders_completion_time;
	company.value.is_support_postamats = fetchedCompany.is_support_postamats === 'Y';
	company.value.is_support_courier_delivery = fetchedCompany.is_support_courier_delivery === 'Y';
	company.value.is_support_pickup_points = fetchedCompany.is_support_pickup_points === 'Y';
	company.value.is_active = fetchedCompany.is_active === 'Y';
	company.value.shipping_cost_ids = fetchedCompany.shipping_cost_ids ?? [];
	pickupPointsDeliverySettings.value = fetchedCompany.delivery_settings.filter(setting => setting.delivery_type === 'pickup_point')[0];
	couriersDeliverySettings.value = fetchedCompany.delivery_settings.filter(setting => setting.delivery_type === 'courier_city')[0];
	postamatsDeliverySettings.value = fetchedCompany.delivery_settings.filter(setting => setting.delivery_type === 'postamat')[0];
};

const deliveryType = ref();
const openCourierSettings = async () => {
	deliverySettings.value = couriersDeliverySettings.value || '';
	settingsId.value = couriersDeliverySettings.value?.id || '';
	deliveryType.value = 'courier_city';
	popupTitle.value = localization.t('text.transport_company_popup_courier_header');
	settingsOne.value = localization.t('text.transport_company_popup_settings_for_all_pick_up_points');
	settingsTwo.value = localization.t('text.transport_company_popup_settings_for_all_postmats');

	await forceRerender();
	toggleTransferSettingsPopup();
};

const openPickupPointsSettings = async () => {
	deliverySettings.value = pickupPointsDeliverySettings.value || {};
	settingsId.value = pickupPointsDeliverySettings.value?.id || '';
	deliveryType.value = 'pickup_point';
	popupTitle.value = localization.t('text.transport_company_popup_pick_up_point_header');
	settingsTwo.value = localization.t('text.transport_company_popup_settings_for_all_postmats');
	settingsOne.value = localization.t('text.transport_company_popup_settings_for_all_cities');

	await forceRerender();
	toggleTransferSettingsPopup();
};

const openPostamatsSettings = async () => {
	deliverySettings.value = postamatsDeliverySettings.value || '';
	settingsId.value = postamatsDeliverySettings.value?.id || '';
	deliveryType.value = 'postamat';
	popupTitle.value = localization.t('text.transport_company_popup_postmats_header');
	settingsTwo.value = localization.t('text.transport_company_popup_settings_for_all_pick_up_points');
	settingsOne.value = localization.t('text.transport_company_popup_settings_for_all_cities');

	await forceRerender();
	toggleTransferSettingsPopup();
};

const start_time = ref();
const end_time = ref();
onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard/transport-companies');
	await sleep(1);
	store.commit('setLoading', true);
	validation.value = await fetchApi(
		localization,
		(err, code) =>
			store.commit('setErrorMessage', {
				errMsg: err,
				errCode: code,
			}),
		axios => axios.get('form-validation/transportCompany/createOrUpdateDeliverySettings'),
	);
	await companyInit();
	store.commit('setLoading', false);
	IMask(start_time.value, timeMask);
	IMask(end_time.value, timeMask);
});

onMounted(() => {
	document.title += ` - ${localization.t('text.header_edit')}`;
});

const goToCityList = () => {
	window.location.replace(`/dashboard/delivery-cities?tc_id=${company.value.id}`);
};

const goToPickupPointsList = () => {
	window.location.replace(`/dashboard/pickup-points?tc_id=${company.value.id}`);
};

const goToPostamatsList = () => {
	window.location.replace(`/dashboard/postamats?tc_id=${company.value.id}`);
};

const isShippingRatesModalVisible = ref(false);
const shippingCostIdFirst = computed(() => {
	const ids = company.value.shipping_cost_ids;
	if (!Array.isArray(ids) || ids.length === 0) return null;
	return ids[0];
});

const toggleShippingRatesModal = () => {
	isShippingRatesModalVisible.value = !isShippingRatesModalVisible.value;
};

const openShippingRates = () => {
	if (!company.value.shipping_cost_ids?.length) {
		toaster.error(toast, localization.t('text.transport_company_shipping_rates_no_record'));
		return;
	}
	isShippingRatesModalVisible.value = true;
};

const onShippingRatesSaved = async () => {
	await companyInit();
};
</script>
