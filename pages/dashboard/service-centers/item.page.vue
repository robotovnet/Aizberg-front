<template>
    <AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
	<div class="main__content">
	    <div class="main__inner main__inner--short">
		<app-page-input
		    :errors="errors?.errors?.name"
		    v-model="sc.name"
		    :title="$t('text.sc_name')"
		    @validate="removeError(errors?.errors?.name)"
		    :placeholder="$t('text.sc_name_placeholder')"></app-page-input>
	    </div>
	    <div class="main__inner main__inner--short">
		<span v-for="error in errors?.errors?.country_id" class="main__error main__error-message" v-html="error" />
		<span class="main__text">{{ $t('text.sc_country') }}</span>
		<select class="main__select select" v-model="sc.country_id" @change="setCities(sc.country_id)">
		    <option value="0" disabled selected>{{ $t('text.sc_country_choose') }}</option>
		    <option :value="country.id" v-for="country in countries">{{ country.name }}</option>
		</select>
	    </div>
	    <div class="main__inner main__inner--short">
		<span v-for="error in errors?.errors?.city_id" class="main__error main__error-message" v-html="error" />
		<span class="main__text">{{ $t('text.sc_city') }}</span>
		<select @change="removeError(errors?.errors?.city_id)" class="main__select select" v-model="sc.city_id">
		    <option value="0" disabled selected>{{ $t('text.sc_city_choose') }}</option>
		    <option :value="city.id" v-for="city in cities">{{ city.name }}</option>
		</select>
	    </div>
	    <div class="main__inner main__inner--short main__inner--top">
		<span v-for="error in errors?.errors?.address" class="main__error main__error-message" v-html="error" />
		<span class="main__text">{{ $t('text.sc_address') }}</span>
		<textarea
		    @input="removeError(errors?.errors?.address)"
		    v-model="sc.address"
		    class="main__textarea main__textarea--md textarea"
		    :placeholder="$t('text.sc_address_placeholder')"></textarea>
	    </div>

	     <div class="main__inner main__inner--short">
		<app-page-input
		    :errors="errors?.errors?.site"
		    v-model="sc.site"
		    :title="$t('text.sc_site')"
		    @validate="() => {}"
		    :placeholder="$t('text.sc_site')"></app-page-input>
	    </div>

	    <div class="main__inner main__inner--short">
		<app-page-input
		    :errors="errors?.errors?.postal_code"
		    v-model="sc.postal_code"
		    :title="$t('text.sc_postal_code')"
		    @validate="() => {}"
		    :placeholder="$t('text.sc_postal_code_placeholder')"></app-page-input>
	    </div>

	    <!-- Телефон-->
	    <template :key="idx" v-for="(mask, idx) in phoneMasks">
		<div
		    v-show="currentCountry && currentCountry.code === mask.code && phoneMasks.length"
		    class="main__inner main__inner--short">
		    <span class="main__text">{{ $t('text.sc_phone') }}</span>

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
		<span class="main__text">{{ $t('text.sc_phone') }}</span>
		<input
		    v-model="phoneWithoutMask"
		    type="text"
		    class="main__input input"
		    :placeholder="$t('text.sc_phone_placeholder')"
		    @input="removeError(errors?.errors?.phone)" />

		<span class="main__error main__error-message" v-html="errors?.errors?.phone" />
	    </div>
	    <!-- Координаты -->
	    <div class="main__inner main__inner--short">
		<span class="lat__error" v-html="errors?.errors?.lat" />
		<span class="main__text">{{ $t('text.sc_coords') }}</span>
		<div class="lat_lon">
		    <input
			v-model="sc.lat"
			type="text"
			@input="removeError(errors?.errors?.lat)"
			class="input"
			style="width: 100%"
			:placeholder="$t('text.sc_coords_lat')" />
		    <span v-for="error in errors?.errors?.lng" class="main__error" v-html="error" />
		    <input
			v-model="sc.lng"
			type="text"
			@input="removeError(errors?.errors?.lng)"
			class="input"
			style="width: 100%"
			:placeholder="$t('text.sc_coords_lon')" />
		</div>
	    </div>
	    <div class="main__inner main__inner--short main__inner--top">
		<span class="main__text">{{ $t('text.sc_how_to_get_here') }}</span>
		<textarea
		    v-model="sc.address_comment"
		    class="main__textarea main__textarea--md textarea"
		    :placeholder="$t('text.sc_how_to_get_here_placeholder')"></textarea>
	    </div>
	    <!-- Metro -->
	    <div class="main__inner main__inner--short">
		<app-page-input
		    :errors="errors?.errors?.metro_station"
		    v-model="sc.metro_station"
		    :title="$t('text.sc_metro')"
		    @validate="() => {}"
		    :placeholder="$t('text.sc_metro_placeholder')"></app-page-input>
	    </div>
	    <!-- График работы  -->
	    <div class="main__inner main__inner--short main__inner--top">
		<span v-for="error in errors?.errors?.work_time" class="main__error main__error-message" v-html="error" />
		<span class="main__text">{{ $t('text.sc_work_schedule') }}</span>
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
			    <div class="main__help">{{ $t('text.sc_break') }} {{ $t('text.from') }}</div>
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
	    
	    <div class="main__inner main__inner--end">
		<button v-if="isEditMode" @click="saveOrUpdate('update')" class="btn mt-25">
		    {{ $t('text.sc_button_edit') }}
		</button>
		<button v-else @click="saveOrUpdate('save')" class="btn mt-25">{{ $t('text.sc_button_add') }}</button>
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
import countriesService from '../../../services/countriesService';
import citiesService from '../../../services/citiesService';
import timeMask from '../../../utils/timeMaskRules';
import AppPhoneInput from '../../_components/AppPhoneInput.vue';
import serviceCenterService from '../../../services/serviceCenterService';
import AppPageInput from '../../_components/AppPageInput.vue';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useWorkingTimeHandler from '../../../composables/pages/dashboard/transportCompanies/useWorkingTimeHandler';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import sleep from '../../../utils/sleep';
import phoneMaskService from '../../../services/phoneMaskService';
import redirect from '../../../utils/redirect';
// Data values
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const companies = ref();
const cities = ref();
const countries = ref();
const phoneWithoutMask = ref();
const sc = ref<any>({
    name: '',
    country_id: 0,
    city_id: 0,
    address: '',
    address_comment: '',
    postal_code: '',
    site: '',
    phone: '',
    lat: '',
    lng: '',
    metro_station: null,
    work_time: '',
    break_work_time: '',
});
const phoneInput = ref<any>([]);
const phoneMasks = ref();
const currentCountry = ref();
const fetchedCities = ref();
let isClicked = false;
const errorNames = [
    'address',
    'address_comment',
    'city_id',
    'country_id',
    'lat',
    'lng',
    'metro_station',
    'name',
    'site',
    'phone',
    'postal_code',
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
    name: sc.value.name,
    country_id: sc.value.country_id,
    city_id: sc.value.city_id,
    address: sc.value.address,
    address_comment: sc.value.address_comment,
    postal_code: sc.value.postal_code,
    site: sc.value.site,
    lat: sc.value.lat,
    lng: sc.value.lng,
    phone: telephone.value,
    metro_station: sc.value.metro_station,
    work_time: timeToString().workTime,
    break_work_time: timeToString().breakTime,
}));

// Composables
const { canEdit, canView, itemId, isEditMode } = usePageInit('transportcompany');
const { create, update } = useCreateOrUpdate(serviceCenterService, errorNames, '/dashboard/service-centers');
const { week, workFrom, workTo, breakFrom, breakTo, workTimeToJson, timeToString } = useWorkingTimeHandler();
const { validate, errors, removeError } = useValidationHandler();

// Watchers
onBeforeMount(async () => {
    if (!canEdit.value) redirect('/dashboard/service-centers');
    const urlParams = new URLSearchParams(window.location.search);
    itemId.value = urlParams.get('edit');
    isEditMode.value = !!itemId.value;
    document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
    await sleep(1);
    store.commit('setLoading', true);
    Promise.all([
	countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	phoneMaskService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	isEditMode.value ? serviceCenterService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : {},
    ])
	.then(
	    values =>
		([countries.value, fetchedCities.value, phoneMasks.value, sc.value] = [...values]),
	)
	.then(() => {
	    setPhoneMask();
	    phoneMasks.value.forEach(mask => (mask.vmodel = ''));
	    if (!isEditMode.value) setCities();
	    if (isEditMode.value) {
		workTimeToJson(sc.value.work_time, sc.value.break_work_time);
		currentCountry.value = countries.value.find(c => c.id === sc.value.country_id);
		setCities(currentCountry.value?.id);
		phoneWithoutMask.value = sc.value.phone;
		phoneMasks.value.forEach((mask, idx) => {
		    mask.vmodel = sc.value.phone?.replace(/[^0-9]/g, '');
		    if (mask.code == currentCountry.value?.code) {
			mask.vmodel = sc.value?.phone;
			phoneInput.value[idx].value = sc.value.phone?.replace(/[^0-9]/g, '') || '';
		    }
		});
		setPhoneMask(sc.value.phone ? sc.value.phone.toString().replace(/\D/g, '') : '');
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
	else sc.value.city_id = 0;
    } else {
	sc.value.country_id = '0';
	sc.value.city_id = 0;
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
