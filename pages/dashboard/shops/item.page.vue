<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.shop_sub_domain') }}</span>
				<span class="main__error main__error-message" v-html="errors?.errors?.subdomain" />
				<div class="main__block main__block--full">
					<input
						v-model="subdomain"
						:disabled="isWithoutSubdomain"
						type="text"
						class="main__input input"
						:placeholder="$t('text.shop_sub_domain_placeholder')"
						@input="removeError(errors?.errors?.subdomain)" />
					<label for="type-checkbox1" class="checkbox-group main__checkbox">
						<span>{{ $t('text.shop_without_sub_domain') }}</span>
						<input v-model="isWithoutSubdomain" type="checkbox" id="type-checkbox1" class="checkbox-group__checkbox" />
					</label>
				</div>
			</div>
			<div class="main__inner main__inner--short">
				<span
					:key="idx"
					v-for="(error, idx) in errors?.errors?.country_id"
					class="main__error main__error-message"
					v-html="error" />
				<span class="main__text">{{ $t('text.shop_country') }}</span>
				<select
					class="main__select select"
					v-model="currentCountryId"
					@change="setCities(currentCountryId, errors?.errors?.country_id)">
					<option value="0" disabled selected>{{ $t('text.shop_country') }}</option>
					<option :value="country.id" v-for="country in countries" :key="country.id">{{ country.name }}</option>
				</select>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.shop_city') }}</span>
				<select class="main__select select" v-model="city" @change="removeError(errors?.errors?.city_id)">
					<option value="0" disabled>{{ $t('text.shop_city') }}</option>
					<option :value="item.id" v-for="item in cities" :key="item.id">
						{{ item.name }}
					</option>
				</select>
				<span class="main__error main__error-message" v-html="errors?.errors?.city_id" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.shop_city_name_dative_case') }}</span>
				<input
					v-model="dativeCase"
					ref="isActiveRef"
					type="text"
					class="main__input input"
					:placeholder="$t('text.shop_city_name_dative_case')"
					@input="removeError(errors?.errors?.city_name_dative_case)" />
				<span class="main__error main__error-message" v-html="errors?.errors?.city_name_dative_case" />
			</div>
			<template :key="idx" v-for="(mask, idx) in phoneMasks">
				<div
					v-show="currentCountry && currentCountry.code === mask.code && phoneMasks.length"
					class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.shop_phone') }}</span>

					<input
						:ref="
							el => {
								phoneInput[idx] = el;
							}
						"
						v-model="mask.vmodel"
						type="text"
						class="main__input input"
						:placeholder="mask.mask.replace('{', '').replace('}', '')"
						@input="removeError(errors?.errors?.phone)" />

					<span class="main__error main__error-message" v-html="errors?.errors?.phone" />
				</div>
			</template>
			<div v-show="!phoneMasks?.find(mask => mask?.code === currentCountry?.code)" class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.shop_phone') }}</span>

				<input
					v-model="phoneWithoutMask"
					type="text"
					class="main__input input"
					placeholder="Введите номер телефона"
					@input="removeError(errors?.errors?.phone)" />

				<span class="main__error main__error-message" v-html="errors?.errors?.phone" />
			</div>
			<div class="main__inner main__inner--end">
				<label for="type-checkbox2" class="checkbox-group">
					<span>{{ $t('text.shop_on') }}</span>
					<input
						v-model="isActive"
						@change="selectIsActive"
						type="checkbox"
						id="type-checkbox2"
						class="checkbox-group__checkbox" />
				</label>
			</div>
			<div class="main__inner main__inner--end">
				<button v-if="isEditMode" class="btn" @click="saveOrUpdate('update')">
					{{ $t('text.shop_update') }}
				</button>
				<button v-else class="btn" @click="saveOrUpdate('save')">{{ $t('text.shop_save') }}</button>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { computed, inject, ref, watch, onBeforeMount } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { log } from 'console';
import IMask from 'imask';
import { MainState } from '../../../store/mainStore';
import '../../../extensions/Array';
import toaster from '../../../utils/toaster';
import shopsService from '../../../services/shopsService';
import citiesService from '../../../services/citiesService';
import countriesService from '../../../services/countriesService';
import phoneMaskService from '../../../services/phoneMaskService';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const cities = ref();
const shop = ref<any>({});
const isWithoutSubdomain = ref(false);
const subdomain = ref('');
const city = ref(0);
const dativeCase = ref('');
const phoneWithoutMask = ref<any>();
const isActive = ref();
const isActiveRef = ref();
let isClicked = false;
const errorNames = ['city_id', 'subdomain', 'city_name_dative_case', 'phone', 'country_id'];
const phoneInput = ref<any>([]);
const countries = ref();
const currentCountry = ref();
const currentCountryId = ref(0);
const fetchedCities = ref();
let oldSubdomain = '';
const phoneMasks = ref<any>();

const { canEdit, canView, itemId, isEditMode } = usePageInit('shop');
const { validate, errors, removeError } = useValidationHandler();
const { create, update } = useCreateOrUpdate(shopsService, errorNames, '/dashboard/shops');

watch(
	() => city.value,
	() => {
		setMaskAfterChange();
	},
);
watch(
	() => isWithoutSubdomain.value,
	() => setMaskAfterChange(),
);
onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/shops');
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		phoneMaskService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		isEditMode.value ? shopsService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : {},
	])
		.then(values => {
			[phoneMasks.value, countries.value, fetchedCities.value, shop.value] = [...values];
		})
		.then(() => {
			setPhoneMask();
			phoneMasks.value.forEach(mask => (mask.vmodel = ''));
			const urlParams = new URLSearchParams(window.location.search);
			itemId.value = urlParams.get('edit');
			isEditMode.value = !!itemId.value;
			document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
			if (isEditMode.value) {
				oldSubdomain = shop.value.subdomain;
				subdomain.value = shop.value.subdomain;
				
				const currentCountryCode = fetchedCities.value.find(fCity => fCity.id === shop.value?.city_id)?.country_code;
				if (currentCountryCode === undefined) {
					currentCountry.value = countries.value.find(country => country.code === 'ru');
				} else {
					currentCountry.value = countries.value.find(country => country.code === currentCountryCode);
				}
				
				currentCountryId.value = currentCountry.value.id;
				phoneWithoutMask.value = shop.value.phone;
				dativeCase.value = shop.value.city_name_dative_case;
				isActive.value = shop.value.is_active === 'Y';
				isWithoutSubdomain.value = !shop.value.subdomain;
				setCities(currentCountry.value.id);
				city.value = shop.value?.city_id;
				phoneMasks.value.forEach((mask, idx) => {
					mask.vmodel = shop.value.phone.replace(/[^0-9]/g, '');
					if (mask.code === currentCountry.value.code) {
						mask.vmodel = shop.value?.phone;
						phoneInput.value[idx].value = shop.value.phone.replace(/[^0-9]/g, '');
						const sl = () =>
							new Promise(resolve =>
								setTimeout(() => {
									phoneInput.value[idx].focus();
									phoneInput.value[idx].blur();
								}, 1),
							);
						sl();
					}
				});
			}
			sleep(1);
		})
		.then(() => store.commit('setLoading', false));
});

const setMaskAfterChange = () => {
	if (isEditMode.value) {
		const sl = () =>
			new Promise(resolve =>
				setTimeout(
					() =>
						phoneMasks.value.forEach((mask, idx) => {
							if (mask.code === currentCountry.value?.code) {
								phoneInput.value[idx].value = shop.value?.phone?.replace(/[^0-9]/g, '');
								phoneInput.value[idx].focus();
								phoneInput.value[idx].blur();
								mask.vmodel = shop.value?.phone;
							}
						}),
					1,
				),
			);
		sl();
	}
};
const selectIsActive = err => {
	setMaskAfterChange();
};
const sendData = () => ({
	subdomain: isWithoutSubdomain.value ? '' : subdomain.value,
	city_id: city.value,
	country_id: currentCountryId.value,
	city_name_dative_case: dativeCase.value,
	phone: phoneWithoutMask.value
		? phoneWithoutMask.value?.replace(/[^0-9]/g, '')
		: phoneWithoutMask?.value?.slice(1)
		? phoneWithoutMask.value
		: phoneMasks.value.find(m => m.code === currentCountry.value?.code)?.vmodel.replace(/[^0-9]/g, ''),
	is_active: isActive.value ? 'Y' : 'N',
});
const saveOrUpdate = async selector => {
	isClicked = true;
	if (validate(isClicked, sendData())) {
		return selector === 'save' ? await create(sendData()) : await update(itemId.value, sendData());
	}
};
const setCities = (id = 0, error = '') => {
	removeError(error);
	setMaskAfterChange();
	if (id) {
		currentCountry.value = countries.value.find(c => c.id === id);
		cities.value = fetchedCities.value.filter(fetchedCity => fetchedCity.country_code === currentCountry.value.code);
		city.value = cities.value[0].id;
		setPhoneMask();
	} else {
		cities.value = [];
		city.value = 0;
	}
};
const setPhoneMask = () => {
	for (let index: number = 0; index < phoneMasks.value.length; index++) {
		IMask(phoneInput.value[index], { 
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
		}).updateValue();
	}
};
</script>
