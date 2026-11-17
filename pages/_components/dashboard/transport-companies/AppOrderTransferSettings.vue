<template>
	<div class="user-info__overlay" :class="overlayCls" @click.self="close"></div>
	<div class="modal" :class="activeCls">
		<div class="modal__wrapper modal__wrapper--long">
			<div class="modal__top">
				<h2 class="modal__title">{{ title }}</h2>
			</div>
			<div class="modal__content">
				<!-- Количество дней до переноса в город доставки  -->
				<div class="modal__inner modal__inner--full">
					<span class="main">{{ $t('text.transport_company_popup_days_for_delivery') }}</span>
					<input
						type="text"
						@input="removeError(errors?.errors?.days_transfer)"
						class="main__input main__input--sm input"
						placeholder="1"
						v-model="daysToMove" />
				</div>
				<div class="delivery-settings-error" v-html="errors?.errors?.days_transfer" />
				<!-- Время ,когда переносится на завтра -->
				<div class="modal__inner modal__inner--full">
					<label for="checkbox-033" class="checkbox-group">
						<span>{{ $t('text.transport_company_popup_days_for_transfer') }}</span>
					</label>
					<input
						type="text"
						class="main__input main__input--sm input"
						placeholder="00:00"
						ref="time_to_after_tomorrow"
						v-model="timeToTomorrow" />
				</div>
				<div class="delivery-settings-error" v-html="errors?.errors?.transfer_time_tomorrow" />
				<!-- Время ,когда переносится на послезавтра -->
				<div class="modal__inner modal__inner--full">
					<label for="checkbox-032" class="checkbox-group">
						<span>{{ $t('text.transport_company_popup_days_after_for_transfer') }}</span>
					</label>
					<input
						type="text"
						class="main__input main__input--sm input"
						placeholder="00:00"
						ref="time_to_tomorrow"
						v-model="timeToAfterTomorrow" />
				</div>
				<div class="modal__inner modal__inner--mt">
					<span>{{ $t('text.transport_company_popup_days_of_delivery_goods') }}</span>
				</div>
				<!-- Дни передачи товара в ТК -->
				<div class="modal__checkboxes">
					<label :key="idx" v-for="(day, idx) in week" class="checkbox-group">
						<input v-model="day.active" type="checkbox" class="checkbox-group__checkbox" />
						<span>{{ day.name }}</span>
					</label>
				</div>
				<div class="modal__inner">
					<span>{{ $t('text.transport_company_popup_weekends') }}</span>
				</div>
				<div class="modal__checkboxes">
					<label :key="idx" v-for="(day, idx) in weekends" class="checkbox-group">
						<input v-model="day.active" type="checkbox" class="checkbox-group__checkbox" />
						<span>{{ day.name }}</span>
					</label>
				</div>
				<!-- Применить настройки к другим каналам доставки (на странице ПВЗ скрыто) -->
				<template v-if="!hideCopySettings">
					<div class="modal__inner modal__inner--end">
						<label for="checkbox-031" class="checkbox-group">
							<span>{{ settingsOne }}</span>
							<input type="checkbox" id="checkbox-031" class="checkbox-group__checkbox" v-model="settingsOneValue" />
						</label>
					</div>
					<div class="modal__inner modal__inner--end">
						<label for="checkbox-030" class="checkbox-group">
							<span>{{ settingsTwo }}</span>
							<input type="checkbox" id="checkbox-030" class="checkbox-group__checkbox" v-model="settingsTwoValue" />
						</label>
					</div>
				</template>

				<div class="modal__inner modal__inner--center">
					<button @click="update" class="btn">{{ $t('text.transport_company_popup_save') }}</button>
				</div>
			</div>
			<button class="modal__close" @click="close" :title="$t('text.transport_company_popup_close')"></button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import IMask from 'imask';
import timeMask from '../../../../utils/timeMaskRules';
import getValidator from '../../../../validation/getValidator';

export interface Props {
	companyId: string;
	title: string;
	deliveryType: string;
	show: boolean;
	deliverySettings: object;
	errors: object;
	validation?: object;
	settingsOne?: string;
	settingsTwo?: string;
	settingsThree?: string;
	/** Если задан — сохраняем настройки для конкретного ПВЗ (не «для всей ТК»). */
	deliveryPointId?: string | number | null;
	/** Скрыть чекбоксы «применить к городам / постоматам» и не слать copy_settings. */
	hideCopySettings?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
	companyId: '',
	title: '',
	deliveryType: '',
	show: false,
	deliverySettings: () => ({}),
	errors: () => ({}),
	validation: () => ({}),
	settingsOne: '',
	settingsTwo: '',
	settingsThree: '',
	deliveryPointId: null,
	hideCopySettings: false,
});
const emit = defineEmits(['closePopup', 'updateSettings']);

const localization = useI18n();
const week = ref([
	{ active: false, name: localization.t('text.mo'), value: 'Mn' },
	{ active: false, name: localization.t('text.tu'), value: 'Tu' },
	{ active: false, name: localization.t('text.we'), value: 'Wd' },
	{ active: false, name: localization.t('text.th'), value: 'Th' },
	{ active: false, name: localization.t('text.fr'), value: 'Fr' },
	{ active: false, name: localization.t('text.sa'), value: 'Sa' },
	{ active: false, name: localization.t('text.su'), value: 'Sn' },
]);

const weekends = ref([
	{ active: false, name: localization.t('text.mo'), value: 'Mn' },
	{ active: false, name: localization.t('text.tu'), value: 'Tu' },
	{ active: false, name: localization.t('text.we'), value: 'Wd' },
	{ active: false, name: localization.t('text.th'), value: 'Th' },
	{ active: false, name: localization.t('text.fr'), value: 'Fr' },
	{ active: false, name: localization.t('text.sa'), value: 'Sa' },
	{ active: false, name: localization.t('text.su'), value: 'Sn' },
]);

const activeCls = ref('');
const overlayCls = ref('');
const settings = ref();
const errors = ref(props.errors);
const time_to_tomorrow = ref();
const time_to_after_tomorrow = ref();
const daysToMove = ref();
const timeToTomorrow = ref();
const timeToAfterTomorrow = ref();
const settingsOneValue = ref(false);
const settingsTwoValue = ref(false);

const removeError = err => {
	if (err) {
		for (const error in errors.value.errors) {
			if (err === errors.value.errors[error]) {
				delete errors.value.errors[error];
			}
		}
	}
	errors.value = {};
};
const settingsValues = ['courier_city', 'pickup_point', 'postamat'];

const update = () => {
	let copySettings: any = [];
	if (!props.hideCopySettings) {
		copySettings = settingsValues.filter(sv => sv !== props.deliveryType);
		if (settingsOneValue.value) copySettings = copySettings.slice(0, 1);
		if (settingsTwoValue.value) copySettings = copySettings.slice(1);
		if (!settingsOneValue.value && !settingsTwoValue.value) copySettings = [];
		if (settingsOneValue.value && settingsTwoValue.value) copySettings = settingsValues.filter(sv => sv !== props.deliveryType);
	}
	const deliveryPointId =
		props.deliveryPointId != null && props.deliveryPointId !== '' ? props.deliveryPointId : null;
	settings.value = {
		days_transfer: daysToMove.value,
		transfer_time_tomorrow: timeToTomorrow.value,
		transfer_time_after_tomorrow: timeToAfterTomorrow.value,
		transport_company_working_days: week.value.filter(day => day.active).map(item => item.value),
		transport_company_weekends: weekends.value.filter(day => day.active).map(item => item.value),
		delivery_type: props.deliveryType,
		transport_company_id: props.companyId,
		delivery_point_id: deliveryPointId,
		copy_settings: copySettings,
	};
	const validator: any = getValidator(settings.value, props.validation);
	if (validator.errorCount) {
		errors.value = validator.errors;
		return;
	} else {
		emit('updateSettings', settings.value);
	}
};

const close = () => {
	emit('closePopup');
	activeCls.value = '';
	overlayCls.value = '';
};

const initWeek = (weekArr, fetchedWeek) => {
	return weekArr.map(day => {
		return {
			active: !!fetchedWeek.find(item => item === day.value),
			name: day.name,
			value: day.value,
		};
	});
};

const settingsInit = () => {
	const settingsFetched: any = props.deliverySettings;
	if (settingsFetched && typeof settingsFetched === 'object') {
		week.value = initWeek(
			week.value,
			settingsFetched.transport_company_working_days ? [...settingsFetched.transport_company_working_days] : [],
		);
		weekends.value = initWeek(
			weekends.value,
			settingsFetched.transport_company_weekends ? [...settingsFetched.transport_company_weekends] : [],
		);
		daysToMove.value = settingsFetched.days_transfer;
		timeToTomorrow.value = settingsFetched.transfer_time_tomorrow;
		timeToAfterTomorrow.value = settingsFetched.transfer_time_after_tomorrow;
		if (!props.hideCopySettings) {
			const cs = settingsFetched.copy_settings;
			const others = settingsValues.filter(sv => sv !== props.deliveryType);
			if (Array.isArray(cs)) {
				settingsOneValue.value = others[0] ? cs.includes(others[0]) : false;
				settingsTwoValue.value = others[1] ? cs.includes(others[1]) : false;
			} else {
				settingsOneValue.value = false;
				settingsTwoValue.value = false;
			}
		} else {
			settingsOneValue.value = false;
			settingsTwoValue.value = false;
		}
	}
	return settingsFetched;
};

const togglePopup = () => {
	if (props.show) {
		activeCls.value = 'modal--active';
		overlayCls.value = 'user-info__overlay--active';
	} else {
		activeCls.value = '';
		overlayCls.value = '';
	}
};

watch(
	() => props.show,
	() => {
		settings.value = settingsInit();
		togglePopup();

		IMask(time_to_tomorrow.value, timeMask);
		IMask(time_to_after_tomorrow.value, timeMask);
	},
);

onMounted(() => {});
</script>

<style lang="scss">
.delivery-settings-error {
	margin-top: 10px;
	color: red;
	text-align: right;
}
</style>
