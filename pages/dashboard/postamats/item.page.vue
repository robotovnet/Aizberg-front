<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors?.errors?.name"
					v-model="postamat.name"
					:title="$t('text.postamat_name')"
					@validate="removeError(errors?.errors?.name)"
					:placeholder="$t('text.postamat_name')">
				</app-page-input>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__error main__error-message" v-html="errors?.errors?.country_id"></span>
				<span class="main__text">{{ $t('text.postamat_country') }}</span>
				<select class="main__select select" v-model="postamat.country_id" @change="setCities(postamat.country_id)">
					<option value="0" disabled selected>{{ $t('text.postamat_country_choose') }}</option>
					<option :value="country.id" v-for="country in countries">{{ country.name }}</option>
				</select>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__error main__error-message" v-html="errors?.errors?.city_id"></span>
				<span class="main__text">{{ $t('text.postamat_city') }}</span>
				<select class="main__select select" v-model="postamat.city_id" @change="removeError(errors?.errors?.city_id)">
					<option value="0" disabled selected>{{ $t('text.postamat_city_choose') }}</option>
					<option :value="city.id" v-for="city in cities">{{ city.name }}</option>
				</select>
			</div>
			<div class="main__inner main__inner--short main__inner--top">
				<span class="main__error main__error-message" v-html="errors?.errors?.address"></span>
				<span class="main__text">{{ $t('text.postamat_address') }}</span>
				<textarea
					v-model="postamat.address"
					class="main__textarea main__textarea--md textarea"
					@input="removeError(errors?.errors?.address)"
					:placeholder="$t('text.postamat_address_placeholder')"></textarea>
			</div>
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors?.errors?.postal_code"
					v-model="postamat.postal_code"
					:title="$t('text.postamat_postal_code')"
					@validate="removeError(errors?.errors?.postal_code)"
					:placeholder="$t('text.postamat_postal_code_placeholder')"></app-page-input>
			</div>
			<!-- Телефон  -->
			<template v-for="(mask, idx) in phoneMasks">
				<div
					v-show="currentCountry && currentCountry.code === mask.code && phoneMasks.length"
					class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.postamat_phone') }}</span>
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
				<span class="main__text">{{ $t('text.postamat_phone') }}</span>

				<input
					v-model="phoneWithoutMask"
					type="text"
					class="main__input input"
					placeholder="Введите номер телефона"
					@input="removeError(errors?.errors?.phone)" />

				<span class="main__error main__error-message" v-html="errors?.errors?.phone" />
			</div>
			<!-- Способы оплаты -->
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.postamat_payment_methods') }}</span>
				<div class="main__block">
					<label for="status-product-checkbox1" class="checkbox-group">
						<input
							type="checkbox"
							id="status-product-checkbox1"
							class="checkbox-group__checkbox"
							v-model="postamat.payment_by_cash" />
						<span>{{ $t('text.postamat_payment_cash') }}</span>
					</label>
					<label for="status-product-checkbox2" class="checkbox-group">
						<input
							type="checkbox"
							id="status-product-checkbox2"
							class="checkbox-group__checkbox"
							v-model="postamat.payment_by_card" />
						<span>{{ $t('text.postamat_payment_credit_card') }}</span>
					</label>
				</div>
			</div>
			<!-- Координаты  -->
			<div class="main__inner main__inner--short">
				<span class="lat__error" v-html="errors?.errors?.lat"></span>
				<span class="main__text">{{ $t('text.postamat_coords') }}</span>
				<div class="lat_lon">
					<input
						v-model="postamat.lat"
						type="text"
						@input="removeError(errors?.errors?.lat)"
						class="input main__text"
						style="width: 100%"
						:placeholder="$t('text.postamat_coords_lat')" />
					<span v-for="error in errors?.errors?.lng" class="main__error" v-html="error"></span>
					<input
						v-model="postamat.lng"
						@input="removeError(errors?.errors?.lng)"
						style="width: 100%"
						type="text"
						class="input main__text"
						:placeholder="$t('text.postamat_coords_lon')" />
				</div>
			</div>
			<div class="main__inner main__inner--short main__inner--top">
				<span class="main__text">{{ $t('text.postamat_how_to_get_here') }}</span>
				<textarea
					v-model="postamat.address_comment"
					class="main__textarea main__textarea--md textarea"
					:placeholder="$t('text.postamat_how_to_get_here_placeholder')"></textarea>
			</div>
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors?.errors?.metro_station"
					v-model="postamat.metro_station"
					:title="$t('text.postamat_metro')"
					@validate="() => {}"
					:placeholder="$t('text.postamat_metro_placeholder')"></app-page-input>
			</div>
			<!-- График работы -->
			<div class="main__inner main__inner--short main__inner--top">
				<span v-for="error in errors?.errors?.work_time" class="main__error main__error-message" v-html="error"></span>
				<span class="main__text">{{ $t('text.postamat_work_schedule') }}</span>
				<div class="main__block">
					<div class="main__column main__column--ultra">
						<div :key="day.name" v-for="(day, idx) in week">
							<div class="main__group mb-10">
								<label :for="day.name" class="checkbox-group main__he lp">
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
								<div class="main__help">{{ $t('text.postamat_break') }} {{ $t('text.from') }}</div>
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
			</div>

			<div class="main__inner main__inner--short">
				<span v-for="error in errors?.errors?.transport_companies" class="main__error main__error-message" v-html="error" />
				<span class="main__text">{{ $t('text.postamat_transport_companies') }}</span>
				<select
					class="main__select select"
					style="background-image: none"
					@change="removeError(errors?.errors?.transport_companies)"
					v-model="postamat.transport_companies"
					multiple>
					<option :value="company.id" v-for="company in transportCompanies">{{ company.name }}</option>
				</select>
				<span class="main__error main__error-message" v-html="errors?.errors?.transport_companies" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.postamat_transport_companies_size') }}</span>
				<div class="main__block">
					<input
						v-model="postamat.max_height"
						@input="removeError(errors?.errors?.max_height)"
						type="text"
						class="main__input main__input--sm input"
						placeholder="0" />
					<input
						v-model="postamat.max_width"
						@input="removeError(errors?.errors?.max_width)"
						type="text"
						class="main__input main__input--sm input"
						placeholder="0" />
					<input
						v-model="postamat.max_depth"
						@input="removeError(errors?.errors?.max_depth)"
						type="text"
						class="main__input main__input--sm input"
						placeholder="0" />
				</div>
			</div>
			<div
				class="main__inner main__inner--short"
				v-if="errors?.errors?.max_height || errors?.errors?.max_width || errors?.errors?.max_depth">
				<div class="postamat_errors_block">
					<div v-for="error in errors?.errors?.max_height" class="" v-html="error"></div>
					<br />
					<div v-for="error in errors?.errors?.max_width" class="" v-html="error"></div>
					<br />
					<div v-for="error in errors?.errors?.max_depth" class="" v-html="error"></div>
					<br />
				</div>
			</div>
			<div class="main__inner main__inner--short main__inner--top">
				<span class="main__text">{{ $t('text.postamat_shipment_from_warehouse') }}</span>
				<div class="main__block main__block--double-checkbox">
					<label class="checkbox-group" v-for="(warehouse, idx) in warehouses">
						<input
							type="checkbox"
							@change="removeError(errors?.errors?.warehouses)"
							v-model="warehouse.selected"
							class="checkbox-group__checkbox" />
						<span>{{ warehouse.name }}</span>
					</label>
				</div>
				<span class="main__error main__error-message" v-html="errors?.errors?.warehouses" />
			</div>
			<div class="main__inner main__inner--end">
				<button v-if="isEditMode" @click="saveOrUpdate('update')" class="btn mt-25">{{ $t('text.postamat_button_edit') }}</button>
				<button v-else @click="saveOrUpdate('save')" class="btn mt-25">{{ $t('text.postamat_button_add') }}</button>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, onBeforeMount } from 'vue';
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
import AppPageInput from '../../_components/AppPageInput.vue';
import postamatsService from '../../../services/postamatsService';
import useWorkingTimeHandler from '../../../composables/pages/dashboard/transportCompanies/useWorkingTimeHandler';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import sleep from '../../../utils/sleep';
import warehousesService from '../../../services/warehousesService';
import paymentMethodsService from '../../../services/paymentMethodsService';
import phoneMaskService from '../../../services/phoneMaskService';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const transportCompanies = ref();
const cities = ref();
const countries = ref();
const warehouses = ref();
const phone = ref('');
const point = ref<any>('');
const phoneWithoutMask = ref('');

const postamat = ref<any>({
	name: '',
	country_id: 0,
	city_id: 0,
	adding_method: '',
	address: '',
	address_comment: '',
	payment_by_cash: false,
	payment_by_card: false,
	postal_code: '',
	phone: '',
	lat: '',
	lng: '',
	metro_station: null,
	work_time: '',
	break_work_time: '',
	warehouses: [],
	transport_companies: [],
	max_height: null,
	max_width: null,
	max_depth: null,
});

const { week, workFrom, workTo, breakFrom, breakTo, workTimeToJson, timeToString } = useWorkingTimeHandler();

const { validate, errors, removeError } = useValidationHandler();
const { canEdit, canView, itemId, isEditMode } = usePageInit('transportcompany');

const phoneInput = ref<any>([]);
const phoneMasks = ref();
const phoneForSave = ref();
const setPhoneMask = (phone = '') => {
	for (let index = 0; index < phoneMasks.value.length; index++) {
		const maskOptions = {
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
		};
		
		const mask: any = IMask(phoneInput.value[index], maskOptions);
		mask.unmaskedValue = phone;
		phoneForSave.value = mask.unmaskedValue;
	}
};

const currentCountry = ref();
const setCities = (id = 0) => {
	if (id) {
		currentCountry.value = countries.value.find(c => c.id === id);
		cities.value = fetchedCities.value.filter(fetchedCity => fetchedCity.country_code === currentCountry.value.code);
		if (isEditMode.value) return;
		else postamat.value.city_id = 0;
		setPhoneMask();
	} else {
		postamat.value.country_id = '0';
		postamat.value.city_id = 0;
		cities.value = [];
	}
	if (errors?.value?.errors) removeError(errors?.value.errors?.country_id);
};
const fetchedCities = ref();
const paymentMethods = ref();
onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/postamats');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		warehousesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		paymentMethodsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		phoneMaskService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		isEditMode.value ? postamatsService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : {},
	])
		.then(values => {
			[
				countries.value,
				transportCompanies.value,
				fetchedCities.value,
				warehouses.value,
				paymentMethods.value,
				phoneMasks.value,
				postamat.value,
			] = [...values];
		})
		.then(() => {
			phoneMasks.value.forEach(mask => {
				mask.vmodel = '';
			});
			for (let i = 0; i < workFrom.value.length; i++) {
				IMask(workFrom.value[i], timeMask);
				IMask(workTo.value[i], timeMask);
				IMask(breakFrom.value[i], timeMask);
				IMask(breakTo.value[i], timeMask);
			}
			if (!isEditMode.value) {
				setCities();
				setPhoneMask();
			}
			if (isEditMode.value) {
				setPhoneMask(postamat.value.phone ? postamat.value.phone.toString() : '');
				phone.value = postamat.value.phone;
				postamat.value.payment_by_card = postamat.value.payment_by_card === 'Y';
				postamat.value.payment_by_cash = postamat.value.payment_by_cash === 'Y';
				postamat.value.transport_companies = postamat.value.transport_companies.map(item => item.id);
				currentCountry.value = countries.value.find(c => c.id === postamat.value.country_id);
				// setCities(currentCountry.value?.id);
				cities.value = fetchedCities.value.filter(fetchedCity => fetchedCity.country_code === currentCountry.value?.code);
				warehouses.value.forEach(warehouse => {
					warehouse.selected = false;
					postamat.value.warehouses.forEach(postamatWarehouse => {
						if (warehouse.id == postamatWarehouse.id) {
							warehouse.selected = true;
						}
					});
				});
				phoneWithoutMask.value = postamat.value.phone;
				workTimeToJson(postamat.value.work_time, postamat.value.break_work_time);
			}
			store.commit('setLoading', false);
		});
});

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
let isClicked = false;

const currentWarehouses = ref();
const { create, update } = useCreateOrUpdate(postamatsService, errorNames, '/dashboard/postamats');

const telephone = computed(() => {
	if (!phoneMasks.value?.find(mask => mask?.code === currentCountry.value?.code)) {
		return phoneWithoutMask.value;
	} else {
		return phoneInput.value?.find(val => val?.value)?.value?.replace(/[^0-9]/g, '');
	}
});
const sendData = computed(() => ({
	name: postamat.value.name,
	country_id: postamat.value.country_id,
	city_id: postamat.value.city_id,
	adding_method: 'manual',
	address: postamat.value.address,
	address_comment: postamat.value.address_comment,
	payment_by_card: postamat.value.payment_by_card ? 'Y' : 'N',
	payment_by_cash: postamat.value.payment_by_cash ? 'Y' : 'N',
	postal_code: postamat.value.postal_code,
	lat: postamat.value.lat,
	lng: postamat.value.lng,
	phone: telephone.value,
	max_height: postamat.value.max_height,
	max_width: postamat.value.max_width,
	max_depth: postamat.value.max_depth,
	metro_station: postamat.value.metro_station,
	work_time: timeToString().workTime,
	break_work_time: timeToString().breakTime,
	warehouses: warehouses.value.filter(warehouse => warehouse.selected).map(w => w.id),
	transport_companies: postamat.value.transport_companies ? Object.values(postamat.value.transport_companies) : [],
}));

const saveOrUpdate = async selector => {
	isClicked = true;
	console.log(phoneInput.value?.find(val => val?.value)?.value?.replace(/[^0-9]/g, ''));
	console.log(phoneWithoutMask.value);
	console.log(sendData.value);
	if (validate(isClicked, sendData.value)) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
const phoneMask = computed(() => store.state.currentValidation?.masks?.phone || '');
</script>
