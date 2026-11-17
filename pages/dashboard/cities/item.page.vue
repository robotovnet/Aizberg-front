<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit">
		<div class="main__content main__content--column" v-if="canEdit">
			<div class="main__wrapper">
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.city_title') }}</span>
					<input type="text" class="main__input input" @input="removeError(errors?.errors['names.0.value'])" v-model="cityName" />
					<span class="main__error main__error-message" v-html="errors?.errors['names.0.value']" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.city_country') }}</span>
					<select class="main__select select" v-model="country">
						<option :value="c" v-for="c in countries">
							{{ c }}
						</option>
					</select>
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.city_time_zone') }}</span>
					<select class="main__select select" v-model="timezone">
						<option :value="zone" v-for="zone in timezones">
							{{ zone }}
						</option>
					</select>
				</div>
				<div class="main__inner main__inner--end">
					<label for="type-checkbox" class="checkbox-group">
						<span>{{ $t('text.city_default') }}</span>
						<input
							type="checkbox"
							id="type-checkbox"
							@input="disabled = false"
							v-model="isDefault"
							class="checkbox-group__checkbox" />
					</label>
				</div>
				<div class="main__inner main__inner--end">
					<button class="btn" v-if="isEditMode" @click="saveOrUpdate('update')">{{ $t('text.city_button_update') }}</button>
					<button class="btn" v-else @click="saveOrUpdate('save')" :disabled="canSave">{{ $t('text.city_button_add') }}</button>
				</div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { computed, inject, ref, watch, onBeforeMount } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import countriesService from '../../../services/countriesService';
import citiesService from '../../../services/citiesService';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const disabled = ref<boolean>(true);
const isDefault = ref<boolean>(false);
const countries = ref<any>([]);
const country = ref<any>('ru');
const cityName = ref('');
const city = ref({});
const { canEdit, canView, itemId, isEditMode } = usePageInit('city');
const timezone = ref('Europe/Moscow');
const timezones = [
	'Pacific/Midway',
	'US/Samoa',
	'US/Hawaii',
	'US/Alaska',
	'US/Pacific',
	'America/Tijuana',
	'US/Arizona',
	'US/Mountain',
	'America/Chihuahua',
	'America/Mazatlan',
	'America/Mexico_City',
	'America/Monterrey',
	'Canada/Saskatchewan',
	'US/Central',
	'US/Eastern',
	'US/East-Indiana',
	'America/Bogota',
	'America/Lima',
	'America/Caracas',
	'Canada/Atlantic',
	'America/La_Paz',
	'America/Santiago',
	'Canada/Newfoundland',
	'America/Buenos_Aires',
	'Greenland',
	'Atlantic/Stanley',
	'Atlantic/Azores',
	'Atlantic/Cape_Verde',
	'Africa/Casablanca',
	'Europe/Dublin',
	'Europe/Lisbon',
	'Europe/London',
	'Africa/Monrovia',
	'Europe/Amsterdam',
	'Europe/Belgrade',
	'Europe/Berlin',
	'Europe/Bratislava',
	'Europe/Brussels',
	'Europe/Budapest',
	'Europe/Copenhagen',
	'Europe/Ljubljana',
	'Europe/Madrid',
	'Europe/Paris',
	'Europe/Prague',
	'Europe/Rome',
	'Europe/Sarajevo',
	'Europe/Skopje',
	'Europe/Stockholm',
	'Europe/Vienna',
	'Europe/Warsaw',
	'Europe/Zagreb',
	'Europe/Athens',
	'Europe/Bucharest',
	'Africa/Cairo',
	'Africa/Harare',
	'Europe/Helsinki',
	'Europe/Istanbul',
	'Asia/Jerusalem',
	'Europe/Kiev',
	'Europe/Minsk',
	'Europe/Riga',
	'Europe/Sofia',
	'Europe/Tallinn',
	'Europe/Vilnius',
	'Asia/Baghdad',
	'Asia/Kuwait',
	'Africa/Nairobi',
	'Asia/Riyadh',
	'Europe/Moscow',
	'Asia/Tehran',
	'Asia/Baku',
	'Europe/Volgograd',
	'Asia/Muscat',
	'Asia/Tbilisi',
	'Asia/Yerevan',
	'Asia/Kabul',
	'Asia/Karachi',
	'Asia/Tashkent',
	'Asia/Kolkata',
	'Asia/Kathmandu',
	'Asia/Yekaterinburg',
	'Asia/Almaty',
	'Asia/Dhaka',
	'Asia/Novosibirsk',
	'Asia/Bangkok',
	'Asia/Jakarta',
	'Asia/Krasnoyarsk',
	'Asia/Chongqing',
	'Asia/Hong_Kong',
	'Asia/Kuala_Lumpur',
	'Australia/Perth',
	'Asia/Singapore',
	'Asia/Taipei',
	'Asia/Ulaanbaatar',
	'Asia/Urumqi',
	'Asia/Irkutsk',
	'Asia/Seoul',
	'Asia/Tokyo',
	'Australia/Adelaide',
	'Australia/Darwin',
	'Asia/Yakutsk',
	'Australia/Brisbane',
	'Australia/Canberra',
	'Pacific/Guam',
	'Australia/Hobart',
	'Australia/Melbourne',
	'Pacific/Port_Moresby',
	'Australia/Sydney',
	'Asia/Vladivostok',
	'Asia/Magadan',
	'Pacific/Auckland',
	'Pacific/Fiji',
];
const sendData = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: cityName.value,
		},
	],
	timezone: timezone.value,
	country_code: country.value,
	is_default: isDefault.value ? 'Y' : 'N',
}));

let isClicked = false;
const { validate, errors, removeError } = useValidationHandler();

const errorNames = ['names.0.value'];
const { create, update } = useCreateOrUpdate(citiesService, errorNames, '/dashboard/cities');
const saveOrUpdate = async selector => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};

onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/cities');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	await sleep(1);
	store.commit('setLoading', true);
	let fetchedCountries;
	Promise.all([
		countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		isEditMode.value ? citiesService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : [],
	])
		.then(values => ([fetchedCountries, city.value] = [...values]))
		.then(() => {
			countries.value = fetchedCountries.map(country => country.code);
			if (isEditMode.value) {
				cityName.value = city.value.name;
				country.value = city.value.country_code;
				timezone.value = city.value.timezone;
				isDefault.value = city.value.is_default === 'Y';
			}
		})
		.then(() => store.commit('setLoading', false));
});
const canSave = computed(() => {
	if (!cityName.value) return true;
	return false;
});
</script>
