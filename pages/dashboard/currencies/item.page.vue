<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__content main__content--column">
			<div class="main__wrapper">
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.currency_title') }}</span>
					<input
						type="text"
						class="main__input input"
						v-model="currencyName"
						@input="removeError(errors?.errors['names.0.value'])" />
					<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['names.0.value']" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.currency_code') }}</span>
					<select class="main__select select" v-model="currencyCode">
						<option :key="curCode.id" :value="curCode" v-for="curCode in currencyCodes">
							{{ curCode }}
						</option>
					</select>
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.currency_country') }}</span>
					<select class="main__select select" v-model="country" @select="removeError(errors?.errors['country_code'])">
						<option :key="countryItem.id" :value="countryItem" v-for="countryItem in countries">
							{{ countryItem }}
						</option>
					</select>
					<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['country_code']" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.currency_symbol') }}</span>
					<div class="main__block main__block--full">
						<input type="text" v-model="symbol" class="main__input input" @input="removeError(errors?.errors['symbol'])" />
					</div>
					<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['symbol']" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.currency_extra_charge_to_the_course') }}</span>
					<span
						v-if="errors?.errors['extra_charge']"
						class="main__error main__error-message"
						v-html="errors?.errors['extra_charge']" />
					<div class="main__block main__block--full">
						<input
							type="text"
							v-model="extraCharge"
							class="main__input input"
							@input="removeError(errors?.errors['extra_charge'])" />
						<span>%</span>
					</div>
				</div>
				<div class="main__inner main__inner--end">
					<label for="type-checkbox" class="checkbox-group">
						<span>{{ $t('text.currency_default') }}</span>
						<input type="checkbox" id="type-checkbox" v-model="isDefault" class="checkbox-group__checkbox" />
					</label>
				</div>
				<div class="main__inner main__inner--end">
					<button v-if="isEditMode" :disabled="canSave" @click="saveOrUpdate('update')" class="btn">
						{{ $t('text.currency_button_update') }}
					</button>
					<button v-else @click="saveOrUpdate('save')" :disabled="canSave" class="btn">
						{{ $t('text.currency_button_add') }}
					</button>
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
import currenciesService from '../../../services/currenciesService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import shopsService from '../../../services/shopsService';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const disabled = ref<boolean>(false);
const isDefault = ref<boolean>(false);
const countries = ref<any>([]);
const country = ref<any>('ru');
const currencyName = <any>ref('');
const currencyCode = <any>ref('RUB');
const extraCharge = <any>ref(0);
const symbol = <any>ref('');
const currencyCodes = <any>(
	ref([
		'ADP',
		'AED',
		'AFA',
		'AFN',
		'ALL',
		'AMD',
		'ANG',
		'AOA',
		'AOK',
		'AOR',
		'APS',
		'ARS',
		'ATS',
		'AUD',
		'AWG',
		'AYM',
		'AZM',
		'AZN',
		'BAD',
		'BAM',
		'BBD',
		'BDT',
		'BEC',
		'BEF',
		'BEL',
		'BGJ',
		'BGN',
		'BHD',
		'BIF',
		'BMD',
		'BND',
		'BOB',
		'BRB',
		'BRL',
		'BRR',
		'BSD',
		'BTN',
		'BWP',
		'BYB',
		'BYN',
		'BYR',
		'BZD',
		'CAD',
		'CDF',
		'CHC',
		'CHF',
		'CLP',
		'CNY',
		'COP',
		'COU',
		'CRC',
		'CSD',
		'CSK',
		'CUC',
		'CUP',
		'CVE',
		'CYP',
		'CZK',
		'DDM',
		'DEM',
		'DJF',
		'DKK',
		'DOP',
		'DZD',
		'ECS',
		'ECV',
		'EEK',
		'EGP',
		'ERN',
		'ESA',
		'ESB',
		'ESP',
		'ETB',
		'EUR',
		'FIM',
		'FJD',
		'FKP',
		'FRF',
		'GBP',
		'GEK',
		'GEL',
		'GHC',
		'GHP',
		'GHS',
		'GIP',
		'GMD',
		'GNF',
		'GQE',
		'GRD',
		'GTQ',
		'GWE',
		'GYD',
		'HKD',
		'HNL',
		'HRK',
		'HTG',
		'HUF',
		'IDR',
		'IEP',
		'ILS',
		'INR',
		'IQD',
		'IRR',
		'ISK',
		'ITL',
		'JMD',
		'JOD',
		'JPY',
		'KES',
		'KGS',
		'KHR',
		'KMF',
		'KPW',
		'KRW',
		'KWD',
		'KYD',
		'KZT',
		'LAK',
		'LBP',
		'LKR',
		'LRD',
		'LSL',
		'LTL',
		'LUC',
		'LUF',
		'LUL',
		'LVL',
		'LYD',
		'MAD',
		'MDL',
		'MGA',
		'MGF',
		'MKD',
		'MLF',
		'MMK',
		'MNT',
		'MOP',
		'MRO',
		'MTL',
		'MUR',
		'MVR',
		'MWK',
		'MXN',
		'MYR',
		'MZE',
		'MZN',
		'NAD',
		'NGN',
		'NIO',
		'NLG',
		'NOK',
		'NPR',
		'NZD',
		'OMR',
		'PAB',
		'PEN',
		'PGK',
		'PHP',
		'PKR',
		'PLN',
		'PLZ',
		'PTE',
		'PYG',
		'QAR',
		'RHD',
		'ROK',
		'RON',
		'RSD',
		'RUB',
		'RUR',
		'RWF',
		'SAR',
		'SBD',
		'SCR',
		'SDD',
		'SDG',
		'SEK',
		'SGD',
		'SHP',
		'SIT',
		'SKK',
		'SLL',
		'SOS',
		'SRD',
		'SRG',
		'SSP',
		'STD',
		'SVC',
		'SYP',
		'SZL',
		'THB',
		'TJR',
		'TJS',
		'TMM',
		'TMT',
		'TND',
		'TOP',
		'TPE',
		'TRL',
		'TRY',
		'TTD',
		'TWD',
		'TZS',
		'UAH',
		'UAK',
		'UGX',
		'USD',
		'USS',
		'UYI',
		'UYU',
		'UZS',
		'VEB',
		'VEF',
		'VND',
		'VUV',
		'WST',
		'XAF',
		'XAG',
		'XAU',
		'XCD',
		'XDR',
		'XEU',
		'XOF',
		'XPD',
		'XPF',
		'XPT',
		'YDD',
		'YER',
		'YUD',
		'ZAL',
		'ZAR',
		'ZMK',
		'ZMW',
		'ZRN',
		'ZWL',
		'ZWN',
		'ZWR',
	])
);
const errorNames = ['names.0.value', 'extra_charge', 'symbol', 'country_code', 'code'];
const { canEdit, canView, itemId, isEditMode } = usePageInit('currency');
const sendData = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: currencyName.value,
		},
	],
	code: currencyCode.value,
	symbol: symbol.value,
	country_code: country.value,
	is_default: isDefault.value ? 'Y' : 'N',
	extra_charge: extraCharge.value,
}));

let isClicked = false;
const { validate, errors, removeError } = useValidationHandler();

const { create, update } = useCreateOrUpdate(currenciesService, errorNames, '/dashboard/currencies');
const saveOrUpdate = async selector => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};

const canSave = computed(() => {
	if (!currencyName.value) return true;
	if (!symbol.value) return true;
	return false;
});

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});

const currency = <any>ref({});
onBeforeMount(async () => {
	if (!canView) redirect('/dashboard/currencies');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	await sleep(1);
	store.commit('setLoading', true);
	const fetchedCountries: any = await countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	countries.value = fetchedCountries.map(country => country.code);
	if (isEditMode.value) {
		currency.value = await currenciesService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg));
		currencyName.value = currency.value.name;
		country.value = currency.value.country_code;
		currencyCode.value = currency.value.code;
		symbol.value = currency.value.symbol;
		extraCharge.value = currency.value.extra_charge;
		isDefault.value = currency.value.is_default === 'Y';
	}
	store.commit('setLoading', false);
});
</script>
