<template>
	<app-page :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__sub"></div>
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.level_name') }}</span>
				<input
					type="text"
					class="main__input input"
					v-model="levelName"
					@input="removeError(errors?.errors['names.0.value'])"
					:placeholder="$t('text.level_name_placeholder')" />
				<span
					v-if="errors?.errors['names.0.value']"
					class="main__error main__error-message"
					v-html="errors?.errors['names.0.value']" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.client_type') }}</span>
				<select class="main__select select" @change="removeError(errors?.errors['client_type_id'])" v-model="clientTypeId">
					<option value="null" disabled selected>{{ $t('text.client_type_placeholder') }}</option>
					<option :value="type.id" v-for="(type, idx) in clientTypes" :key="idx">{{ type.name }}</option>
				</select>
				<span
					v-if="errors?.errors['client_type_id']"
					class="main__error main__error-message"
					v-html="errors?.errors['client_type_id']" />
			</div>
			<div class="main__inner main__inner--long">
				<span class="main__text">{{ $t('text.orders_sum_saving_level') }}</span>
				<input
					type="text"
					v-model="amountSaving"
					@input="removeError(errors?.errors['amount_saving'])"
					class="main__input input"
					:placeholder="$t('text.orders_sum_saving_level_placeholder')" />
				<span v-if="errors?.errors['amount_saving']" class="main__error main__error-message" v-html="errors?.errors['amount_saving']" />
			</div>
			<div class="main__inner main__inner--long">
				<span class="main__text">{{ $t('text.orders_sum') }}</span>
				<input
					type="text"
					v-model="amountUp"
					@input="removeError(errors?.errors['amount_up'])"
					class="main__input input"
					:placeholder="$t('text.orders_sum_placeholder')" />
				<span v-if="errors?.errors['amount_up']" class="main__error main__error-message" v-html="errors?.errors['amount_up']" />
			</div>
			<div class="main__inner main__inner--long">
				<span class="main__text">{{ $t('text.total_amount') }}</span>
				<input
					type="text"
					v-model="amountInstantlyUp"
					@input="removeError(errors?.errors['amount_instantly_up'])"
					class="main__input input"
					:placeholder="$t('text.total_amount_placeholder')" />
				<span
					v-if="errors?.errors['amount_instantly_up']"
					class="main__error main__error-message"
					v-html="errors?.errors['amount_instantly_up']" />
			</div>
			<div class="main__inner main__inner--end">
				<span class="main__text">{{ $t('text.level_num') }}: {{ levelNumber }}</span>
				<span v-if="errors?.errors['level_num']" class="main__error main__error-message" v-html="errors?.errors['level_num']" />
			</div>
			<div class="main__inner main__inner--end">
				<span class="main__text">{{ $t('text.duration') }}</span>
				<select v-model="calculationPeriod" @change="removeError(errors?.errors['calculation_period'])" class="main__select select">
					<option :value="month" v-for="(month, idx) in 12" :key="idx">{{ month }}</option>
				</select>
				<span
					v-if="errors?.errors['calculation_period']"
					class="main__error main__error-message"
					v-html="errors?.errors['calculation_period']" />
			</div>
			<div class="main__inner main__inner--end">
				<label class="checkbox-group">
					<input v-model="isEntry" type="checkbox" class="checkbox-group__checkbox" />
					<span>{{ $t('text.start_level') }}</span>
				</label>
			</div>
			<div class="main__inner main__inner--end">
				<button @click="saveOrUpdate(isEditMode ? 'update' : 'save')" class="btn">
					{{ isEditMode ? $t('text.update') : $t('text.add') }}
				</button>
			</div>
		</div>
	</app-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import '../../../extensions/Array';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import clientTypesService from '../../../services/clientTypesService';
import bonusProgramService from '../../../services/bonusProgramService';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';

const store = useStore<MainState>();
const toast = inject('toast') as any;
const localization: any = useI18n();
const errorNames = ['amount_instantly_up', 'amount_up', 'amount_saving', 'calculation_period', 'client_type_id', 'is_entry', 'level_num', 'names.0.value'];

let isClicked = false;
const { canEdit, canView, itemId, isEditMode } = usePageInit('bonusprogram.level');
const { validate, errors, removeError } = useValidationHandler();

const sendData = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: levelName.value,
		},
	],
	client_type_id: clientTypeId.value,
	level_num: levelNumber.value,
	amount_up: amountUp.value,
	amount_saving: amountSaving.value,
	amount_instantly_up: amountInstantlyUp.value,
	is_entry: isEntry.value ? 'Y' : 'N',
	calculation_period: calculationPeriod.value,
}));

const { create, update } = useCreateOrUpdate(bonusProgramService, errorNames, '/dashboard/bonus-program');

const saveOrUpdate = async selector => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};

const clientTypes = ref();
const clientTypeId = ref<any>(null);
const levelName = ref();
const amountUp = ref();
const amountSaving = ref();
const amountInstantlyUp = ref();
const levelNumber = ref<any>(0);
const calculationPeriod = ref<any>(1);
const isEntry = ref<any>(false);

onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/bonus-program');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	let levels;
	let bonusLevel;
	await sleep(1);
	store.commit('setLoading', true);
	const response = Promise.all([
		bonusProgramService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		clientTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		isEditMode.value ? bonusProgramService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : [],
	])
		.then(values => ([levels, clientTypes.value, bonusLevel] = [...values]))
		.then(() => {
			if (levels.length) {
				const max = levels.reduce((acc, curr) => (acc.level_num > curr.level_num ? acc : curr));
				levelNumber.value = max.level_num + 1;
			} else {
				levelNumber.value = 1;
			}
			if (isEditMode.value) {
				levelName.value = bonusLevel.name;
				clientTypeId.value = bonusLevel.client_type_id;
				levelNumber.value = bonusLevel.level_num;
				amountUp.value = bonusLevel.amount_up;
				amountSaving.value = bonusLevel.amount_saving;
				amountInstantlyUp.value = bonusLevel.amount_instantly_up;
				isEntry.value = bonusLevel.is_entry === 'Y';
				calculationPeriod.value = bonusLevel.calculation_period;
			}
		});
	response.then(() => store.commit('setLoading', false));
});
</script>
