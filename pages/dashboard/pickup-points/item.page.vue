<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors?.errors?.name"
					v-model="point.name"
					:title="$t('text.pickup_point_name')"
					@validate="removeError(errors?.errors?.name)"
					:placeholder="$t('text.pickup_point_name')"></app-page-input>
			</div>
			<div class="main__inner main__inner--short">
				<span v-for="error in errors?.errors?.country_id" class="main__error main__error-message" v-html="error" />
				<span class="main__text">{{ $t('text.pickup_point_country') }}</span>
				<select class="main__select select" v-model="point.country_id" @change="setCities(point.country_id)">
					<option value="0" disabled selected>{{ $t('text.pickup_point_country_choose') }}</option>
					<option :value="country.id" v-for="country in countries">{{ country.name }}</option>
				</select>
			</div>
			<div class="main__inner main__inner--short">
				<span v-for="error in errors?.errors?.city_id" class="main__error main__error-message" v-html="error" />
				<span class="main__text">{{ $t('text.pickup_point_city') }}</span>
				<select @change="removeError(errors?.errors?.city_id)" class="main__select select" v-model="point.city_id">
					<option value="0" disabled selected>{{ $t('text.pickup_point_city_choose') }}</option>
					<option :value="city.id" v-for="city in cities">{{ city.name }}</option>
				</select>
			</div>
			<div class="main__inner main__inner--short main__inner--top">
				<span v-for="error in errors?.errors?.address" class="main__error main__error-message" v-html="error" />
				<span class="main__text">{{ $t('text.pickup_point_address') }}</span>
				<textarea
					@input="removeError(errors?.errors?.address)"
					v-model="point.address"
					class="main__textarea main__textarea--md textarea"
					:placeholder="$t('text.pickup_point_address_placeholder')"></textarea>
			</div>
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors?.errors?.postal_code"
					v-model="point.postal_code"
					:title="$t('text.pickup_point_postal_code')"
					@validate="() => {}"
					:placeholder="$t('text.pickup_point_postal_code_placeholder')"></app-page-input>
			</div>

			<!--            Телефон-->
			<template :key="idx" v-for="(mask, idx) in phoneMasks">
				<div
					v-show="currentCountry && currentCountry.code === mask.code && phoneMasks.length"
					class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.pickup_point_phone') }}</span>

					<input
						:ref="
							el => {
								phoneInput[idx] = el;
							}
						"
						type="text"
						class="main__input input"
						:placeholder="mask.mask.replace('{', '').replace('}', '')"
						@input="removeError(errors?.errors?.phone)" />
					<span class="main__error main__error-message" v-html="errors?.errors?.phone" />
				</div>
			</template>
			<div v-show="!phoneMasks?.find(mask => mask?.code === currentCountry?.code)" class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.pickup_point_phone') }}</span>
				<input
					v-model="phoneWithoutMask"
					type="text"
					class="main__input input"
					placeholder="Введите номер телефона"
					@input="removeError(errors?.errors?.phone)" />

				<span class="main__error main__error-message" v-html="errors?.errors?.phone" />
			</div>
			<!-- Способы оплаты  -->
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.pickup_point_payment_methods') }}</span>
				<div class="main__block">
					<label for="status-product-checkbox1" class="checkbox-group">
						<input
							type="checkbox"
							id="status-product-checkbox1"
							class="checkbox-group__checkbox"
							v-model="point.payment_by_cash" />
						<span>{{ $t('text.pickup_point_payment_cash') }}</span>
					</label>
					<label for="status-product-checkbox2" class="checkbox-group">
						<input
							type="checkbox"
							id="status-product-checkbox2"
							class="checkbox-group__checkbox"
							v-model="point.payment_by_card" />
						<span>{{ $t('text.pickup_point_payment_credit_card') }}</span>
					</label>
				</div>
			</div>
			<!-- Координаты -->
			<div class="main__inner main__inner--short">
				<span class="lat__error" v-html="errors?.errors?.lat" />
				<span class="main__text">{{ $t('text.pickup_point_coords') }}</span>
				<div class="lat_lon">
					<input
						v-model="point.lat"
						type="text"
						@input="removeError(errors?.errors?.lat)"
						class="input"
						style="width: 100%"
						:placeholder="$t('text.pickup_point_coords_lat')" />
					<span v-for="error in errors?.errors?.lng" class="main__error" v-html="error" />
					<input
						v-model="point.lng"
						type="text"
						@input="removeError(errors?.errors?.lng)"
						class="input"
						style="width: 100%"
						:placeholder="$t('text.pickup_point_coords_lon')" />
				</div>
			</div>
			<div class="main__inner main__inner--short main__inner--top">
				<span class="main__text">{{ $t('text.pickup_point_how_to_get_here') }}</span>
				<textarea
					v-model="point.address_comment"
					class="main__textarea main__textarea--md textarea"
					:placeholder="$t('text.pickup_point_how_to_get_here_placeholder')"></textarea>
			</div>
			<!-- Metro -->
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors?.errors?.metro_station"
					v-model="point.metro_station"
					:title="$t('text.pickup_point_metro')"
					@validate="() => {}"
					:placeholder="$t('text.pickup_point_metro_placeholder')"></app-page-input>
			</div>
			<!-- График работы  -->
			<div class="main__inner main__inner--short main__inner--top">
				<span v-for="error in errors?.errors?.work_time" class="main__error main__error-message" v-html="error" />
				<span class="main__text">{{ $t('text.pickup_point_work_schedule') }}</span>
				<div class="main__block">
					<div class="main__column main__column--ultra">
						<div :key="day.name" class="main__group" v-for="(day, idx) in week">
							<label :for="day.name" class="checkbox-group main__help">
								<input type="checkbox" :id="day.name" class="checkbox-group__checkbox" v-model="day.enabled" />
								<span>{{ day.name }}</span>
							</label>
							<input
								@input="removeError(errors?.errors?.work_time)"
								type="time"
								:ref="
									el => {
										workFrom[idx] = el;
									}
								"
								class="main__input main__input--sm input"
								placeholder="00:00"
								v-model="day.workFrom"
								:disabled="!day.enabled" />
							<div class="main__help">{{ $t('text.to') }}</div>
							<input
								@input="removeError(errors?.errors?.work_time)"
								type="time"
								class="main__input main__input--sm input"
								placeholder="00:00"
								:ref="
									el => {
										workTo[idx] = el;
									}
								"
								v-model="day.workTo"
								:disabled="!day.enabled" />
							<div class="main__help">{{ $t('text.pickup_point_break') }} {{ $t('text.from') }}</div>
							<input
								@input="removeError(errors?.errors?.work_time)"
								type="time"
								class="main__input main__input--sm input"
								placeholder="00:00"
								:ref="
									el => {
										breakFrom[idx] = el;
									}
								"
								v-model="day.breakFrom"
								:disabled="!day.enabled" />
							<div class="main__help">{{ $t('text.to') }}</div>
							<input
								@input="removeError(errors?.errors?.work_time)"
								type="time"
								class="main__input main__input--sm input"
								placeholder="00:00"
								:ref="
									el => {
										breakTo[idx] = el;
									}
								"
								v-model="day.breakTo"
								:disabled="!day.enabled" />
						</div>
					</div>
				</div>
			</div>
			<div class="main__inner main__inner--short">
				<span v-for="error in errors?.errors?.transport_companies" class="main__error main__error-message" v-html="error" />
				<span class="main__text">{{ $t('text.pickup_point_transport_companies') }}</span>
				<select
					@change="removeError(errors?.errors?.transport_companies)"
					class="main__select select"
					v-model="transportCompanies"
					style="background-image: none"
					multiple>
					<option :value="company.id" v-for="company in companies">{{ company.name }}</option>
				</select>
			</div>

			<div class="main__inner main__inner--short main__inner--top mt-25">
				<span class="main__text">{{ $t('text.pickup_point_shipment_from_warehouse') }}</span>
				<div class="main__block main__block--double-checkbox">
					<label :key="idx" class="checkbox-group" v-for="(warehouse, idx) in warehouses">
						<input type="checkbox" v-model="warehouse.selected" class="checkbox-group__checkbox" />
						<span>{{ warehouse.name }}</span>
					</label>
				</div>
				<span class="main__error main__error-message" v-html="errors?.errors?.warehouses" />
			</div>
			<div v-if="isEditMode" class="main__inner main__inner--short main__inner--top">
				<a href="#" @click.prevent="openPickupPointTransferSettings" class="link modal-btn">{{
					$t('text.transport_company_delivery_settings')
				}}</a>
			</div>
			<div class="main__inner main__inner--end">
				<button v-if="isEditMode" @click="saveOrUpdate('update')" class="btn mt-25">
					{{ $t('text.pickup_point_button_edit') }}
				</button>
				<button v-else @click="saveOrUpdate('save')" class="btn mt-25">{{ $t('text.pickup_point_button_add') }}</button>
			</div>
		</div>
		<AppOrderTransferSettings
			v-if="renderTransferSettings"
			:validation="validation"
			:errors="errors"
			:show="isTransferSettingsVisible"
			:title="popupTitle"
			:deliverySettings="deliverySettings"
			:deliveryType="deliveryType"
			:companyId="transferCompanyIdForModal"
			:deliveryPointId="itemId"
			:hideCopySettings="true"
			@closePopup="toggleTransferSettingsPopup"
			@updateSettings="updateTransferSettings"></AppOrderTransferSettings>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, onBeforeMount, nextTick } from 'vue';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import IMask from 'imask';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import transportCompaniesService from '../../../services/transportCompaniesService';
import countriesService from '../../../services/countriesService';
import citiesService from '../../../services/citiesService';
import timeMask from '../../../utils/timeMaskRules';
import AppPhoneInput from '../../_components/AppPhoneInput.vue';
import pickUpPointService from '../../../services/pickUpPointService';
import AppPageInput from '../../_components/AppPageInput.vue';
import { ADDING_METHOD_MANUAL } from '../../../utils/constants';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useWorkingTimeHandler from '../../../composables/pages/dashboard/transportCompanies/useWorkingTimeHandler';
import warehousesService from '../../../services/warehousesService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import sleep from '../../../utils/sleep';
import phoneMaskService from '../../../services/phoneMaskService';
import redirect from '../../../utils/redirect';
import fetchApi from '../../../network/fetchEndpoint';
import AppOrderTransferSettings from '../../_components/dashboard/transport-companies/AppOrderTransferSettings.vue';
// Data values
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const pickupPoints = ref();
const companies = ref();
const cities = ref();
const countries = ref();
const warehouses = ref();
const transportCompanies = ref([]);
const phoneWithoutMask = ref();
const point = ref<any>({
	name: '',
	country_id: 0,
	city_id: 0,
	adding_method: '',
	address: '',
	address_comment: '',
	payment_by_card: false,
	payment_by_cash: false,
	postal_code: '',
	phone: '',
	lat: '',
	lng: '',
	metro_station: null,
	work_time: '',
	break_work_time: '',
	warehouses: [],
	transport_companies: [],
	/** Основная ТК с точки зрения API (если transport_companies пустой) */
	tc_id: null,
	delivery_settings: [],
});
const phoneInput = ref<any>([]);
const phoneMasks = ref();
const currentCountry = ref();
const fetchedCities = ref();
let isClicked = false;
const errorNames = [
	'adding_method',
	'address',
	'address_comment',
	'city_id',
	'country_id',
	'lat',
	'lng',
	'metro_station',
	'name',
	'payment_by_card',
	'payment_by_cash',
	'phone',
	'postal_code',
	'transport_companies',
	'work_time',
];
const telephone = computed(() => {
	if (phoneMasks.value?.find(mask => mask?.code === currentCountry.value?.code)) {
		return phoneInput.value?.find(val => val?.value)?.value?.replace(/[^0-9]/g, '');
	} else {
		return phoneWithoutMask.value;
	}
});
const sendData = computed(() => ({
	name: point.value.name,
	country_id: point.value.country_id,
	city_id: point.value.city_id,
	adding_method: 'manual',
	address: point.value.address,
	address_comment: point.value.address_comment,
	payment_by_card: point.value.payment_by_card ? 'Y' : 'N',
	payment_by_cash: point.value.payment_by_cash ? 'Y' : 'N',
	postal_code: point.value.postal_code,

	lat: point.value.lat,
	lng: point.value.lng,
	phone: telephone.value,
	metro_station: point.value.metro_station,
	work_time: timeToString().workTime,
	break_work_time: timeToString().breakTime,
	warehouses: warehouses.value.filter(warehouse => warehouse.selected).map(w => w.id),
	transport_companies: Object.values(transportCompanies.value),
}));

// Composables
const { canEdit, canView, itemId, isEditMode } = usePageInit('transportcompany');
const { create, update } = useCreateOrUpdate(pickUpPointService, errorNames, '/dashboard/pickup-points');
const { week, workFrom, workTo, breakFrom, breakTo, workTimeToJson, timeToString } = useWorkingTimeHandler();
const { validate, errors, removeError } = useValidationHandler();

const renderTransferSettings = ref(true);
const forceRerenderTransferSettings = async () => {
	renderTransferSettings.value = false;
	await nextTick();
	renderTransferSettings.value = true;
};
const validation = ref();
const isTransferSettingsVisible = ref(false);
const toggleTransferSettingsPopup = () => {
	isTransferSettingsVisible.value = !isTransferSettingsVisible.value;
};
const deliverySettings = ref();
const settingsId = ref();
const popupTitle = ref();
const deliveryType = ref();
const transferCompanyIdForModal = ref('');

/** Первая ТК для ПВЗ: из массива transport_companies, иначе поле tc_id из API (часто при пустом transport_companies). */
const getPrimaryTransportCompanyId = () => {
	const fromList = point.value.transport_companies?.[0]?.id;
	if (fromList != null && fromList !== '') return fromList;
	const fromTcId = point.value.tc_id;
	if (fromTcId != null && fromTcId !== '') return fromTcId;
	return null;
};

/** Настройки передачи: массив по ТК; сопоставляем с основной ТК, при отсутствии — одиночная запись или первая в списке. */
const findPickupPointDeliverySettings = () => {
	const list = point.value?.delivery_settings;
	if (!Array.isArray(list) || !list.length) return null;

	const forThisPoint = list.filter(
		s =>
			s.delivery_type === 'pickup_point' &&
			s.delivery_point_id != null &&
			String(s.delivery_point_id) === String(itemId.value),
	);

	const primaryTcId = getPrimaryTransportCompanyId();
	if (primaryTcId != null) {
		const forPrimaryTc = forThisPoint.find(s => String(s.transport_company_id) === String(primaryTcId));
		if (forPrimaryTc) return forPrimaryTc;
	}

	if (forThisPoint.length === 1) return forThisPoint[0];

	if (forThisPoint.length > 1) return forThisPoint[0];

	return null;
};

const openPickupPointTransferSettings = async () => {
	const settingsRow = findPickupPointDeliverySettings();
	deliverySettings.value = settingsRow || {};
	settingsId.value = settingsRow?.id || '';
	deliveryType.value = 'pickup_point';
	popupTitle.value =
		localization.t('text.transport_company_popup_pick_up_point_header') + (point.value.name ? `«${point.value.name}»` : '');
	transferCompanyIdForModal.value = String(
		settingsRow?.transport_company_id ?? getPrimaryTransportCompanyId() ?? '',
	);
	await forceRerenderTransferSettings();
	toggleTransferSettingsPopup();
};

const updateTransferSettings = async settings => {
	if (settingsId.value) {
		const response = await transportCompaniesService.updateDeliverySettings(localization, settingsId.value, settings, errMsg =>
			toaster.error(toast, errMsg),
		);
		if (response.message === 'success') {
			toaster.success(toast, localization.t('text.generalSuccessUpdated'));
			toggleTransferSettingsPopup();
			await refreshPickupPointDeliverySettings();
		}
	} else {
		const response = await transportCompaniesService.createDeliverySettings(localization, settings, errMsg =>
			toaster.error(toast, errMsg),
		);
		if (response.message === 'success') {
			toaster.success(toast, localization.t('text.generalSuccessUpdated'));
			toggleTransferSettingsPopup();
			await refreshPickupPointDeliverySettings();
		}
	}
};

const refreshPickupPointDeliverySettings = async () => {
	if (!itemId.value) return;
	store.commit('setLoading', true);
	const refreshed = await pickUpPointService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
	if (refreshed?.delivery_settings) {
		point.value.delivery_settings = refreshed.delivery_settings;
	}
};

// Watchers
onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/pickup-points');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		warehousesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		phoneMaskService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		fetchApi(
			localization,
			errMsg => toaster.error(toast, errMsg),
			axios => axios.get('form-validation/transportCompany/createOrUpdateDeliverySettings'),
		),
		isEditMode.value ? pickUpPointService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : {},
	])
		.then(
			values =>
				([
					countries.value,
					fetchedCities.value,
					warehouses.value,
					companies.value,
					phoneMasks.value,
					validation.value,
					point.value,
				] = [...values]),
		)
		.then(() => {
			setPhoneMask();
			phoneMasks.value.forEach(mask => (mask.vmodel = ''));
			if (!isEditMode.value) setCities();
			if (isEditMode.value) {
				if (!Array.isArray(point.value.delivery_settings)) {
					point.value.delivery_settings = [];
				}
				point.value.payment_by_card = point.value.payment_by_card === 'Y';
				point.value.payment_by_cash = point.value.payment_by_cash === 'Y';
				workTimeToJson(point.value.work_time, point.value.break_work_time);
				currentCountry.value = countries.value.find(c => c.id === point.value.country_id);
				setCities(currentCountry.value?.id);
				phoneWithoutMask.value = point.value.phone;
				transportCompanies.value = point.value.transport_companies.map(item => item.id);
				warehouses.value.forEach(warehouse => {
					warehouse.selected = false;
					point.value.warehouses.forEach(pointWarehouse => {
						if (warehouse.id === pointWarehouse.id) {
							warehouse.selected = true;
						}
					});
				});
				phoneMasks.value.forEach((mask, idx) => {
					mask.vmodel = point.value.phone?.replace(/[^0-9]/g, '');
					if (mask.code == currentCountry.value?.code) {
						mask.vmodel = point.value?.phone;
						phoneInput.value[idx].value = point.value.phone?.replace(/[^0-9]/g, '') || '';
					}
				});
				setPhoneMask(point.value.phone ? point.value.phone.toString().replace(/\D/g, '') : '');
			}
		})
		.then(() => store.commit('setLoading', false));
	for (let i = 0; i < workFrom.value.length; i++) {
		IMask(workFrom.value[i], timeMask);
		IMask(workTo.value[i], timeMask);
		IMask(breakFrom.value[i], timeMask);
		IMask(breakTo.value[i], timeMask);
	}
});

const setCities = (id = 0) => {
	if (id) {
		currentCountry.value = countries.value.find(c => c.id === id);
		cities.value = fetchedCities.value.filter(fetchedCity => fetchedCity.country_code === currentCountry.value.code);
		if (isEditMode.value) return;
		else point.value.city_id = 0;
	} else {
		point.value.country_id = '0';
		point.value.city_id = 0;
		cities.value = [];
	}
	if (errors?.value?.errors) removeError(errors?.value.errors?.country_id);
};
const saveOrUpdate = async selector => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};
const setPhoneMask = (phone = '') => {
	for (let index = 0; index < phoneMasks.value.length; index++) {
		const mask = IMask(phoneInput.value[index], {
			mask: phoneMasks.value[index].mask, 
			prepare: function (appended, masked) {
				if (masked.mask === "+{7} (000) 000-00-00") {
					if (appended === '8' && masked.value === '') {
						return '';
					}
			
					if (appended === '7' && masked.value === '') {
						return '';
					}
			
					if (appended === '8' && masked.value === '+7 (') {
						return '';
					}
			
					if (appended === '7' && masked.value === '+7 (') {
						return '';
					}
				}
			
				return appended;
			},
		});
		mask.unmaskedValue = phone;
	}
};
</script>
