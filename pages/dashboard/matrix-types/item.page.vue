<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__content main__content--column">
			<div class="main__wrapper">
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.matrix_type_title') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.matrix_type_title_placeholder')"
						v-model="matrixType.name"
						@input="removeError(errors?.errors.name)" />
					<span class="main__error main__error-message" v-html="errors?.errors.name" />
				</div>
				<div class='main__inner main__inner--short'>
					<span class="main__text">{{ $t('text.margin_up_to_BP') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.margin_up_to_BP_placeholder')"
						v-model="matrixType.margin_up_to_BP"
						@input="removeError(errors?.errors.margin_up_to_BP)" />
					<span class="main__error main__error-message" v-html="errors?.errors.margin_up_to_BP" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.EXW_price') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.EXW_price_placeholder')"
						v-model="matrixType.EXW_price"
						@input="removeError(errors?.errors.EXW_price)" />
					<span class="main__error main__error-message" v-html="errors?.errors.EXW_price" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.weight_in_kg') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.weight_in_kg_placeholder')"
						v-model="matrixType.weight_in_kg"
						@input="removeError(errors?.errors.weight_in_kg)" />
					<span class="main__error main__error-message" v-html="errors?.errors.weight_in_kg" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.MRP_markup') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.MRP_markup_placeholder')"
						v-model="matrixType.MRP_markup"
						@input="removeError(errors?.errors.MRP_markup)" />
					<span class="main__error main__error-message" v-html="errors?.errors.MRP_markup" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.RRP_markup') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.RRP_markup_placeholder')"
						v-model="matrixType.RRP_markup"
						@input="removeError(errors?.errors.RRP_markup)" />
					<span class="main__error main__error-message" v-html="errors?.errors.RRP_markup" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.margin_up_to_P2') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.margin_up_to_P2_placeholder')"
						v-model="matrixType.margin_up_to_P2"
						@input="removeError(errors?.errors.margin_up_to_P2)" />
					<span class="main__error main__error-message" v-html="errors?.errors.margin_up_to_P2" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.margin_up_to_P3') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.margin_up_to_P3_placeholder')"
						v-model="matrixType.margin_up_to_P3"
						@input="removeError(errors?.errors.margin_up_to_P3)" />
					<span class="main__error main__error-message" v-html="errors?.errors.margin_up_to_P3" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.margin_up_to_P4') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.margin_up_to_P4_placeholder')"
						v-model="matrixType.margin_up_to_P4"
						@input="removeError(errors?.errors.margin_up_to_P4)" />
					<span class="main__error main__error-message" v-html="errors?.errors.margin_up_to_P4" />
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.mark_up_contract') }}</span>
					<input
						type="text"
						class="auth-form__input input"
						:placeholder="$t('text.mark_up_contract_placeholder')"
						v-model="matrixType.mark_up_contract"
						@input="removeError(errors?.errors.mark_up_contract)" />
					<span class="main__error main__error-message" v-html="errors?.errors.mark_up_contract" />
				</div>
				<div class="main__inner main__inner--end" style="margin-top: 18px;">
					<button v-if="isEditMode" class="btn" @click="saveOrUpdate('update')">
						{{ $t('text.matrix_type_button_update') }}
					</button>
					<button v-else class="btn" :disabled="disabled" @click="saveOrUpdate('save')">
						{{ $t('text.matrix_type_button_add') }}
					</button>
				</div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import matrixTypesService from '../../../services/matrixTypesService';
import '../../../extensions/Array';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const disabled = ref<boolean>(false);
const matrixType = ref<any>({
	name: '',
	margin_up_to_BP: '',
	EXW_price: '',
	weight_in_kg: '',
	MRP_markup: '',
	RRP_markup: '',
	margin_up_to_P2: '',
	margin_up_to_P3: '',
	margin_up_to_P4: '',
	mark_up_contract: ''
});
const sendData = computed(() => ({
	name: matrixType.value.name,
	margin_up_to_BP: matrixType.value.margin_up_to_BP,
	EXW_price: matrixType.value.EXW_price,
	weight_in_kg: matrixType.value.weight_in_kg,
	MRP_markup: matrixType.value.MRP_markup,
	RRP_markup: matrixType.value.RRP_markup,
	margin_up_to_P2: matrixType.value.margin_up_to_P2,
	margin_up_to_P3: matrixType.value.margin_up_to_P3,
	margin_up_to_P4: matrixType.value.margin_up_to_P4,
	mark_up_contract: matrixType.value.mark_up_contract
}));
const { canEdit, canView, itemId, isEditMode } = usePageInit('matrixtype');

let isClicked = false;
const { validate, errors, removeError } = useValidationHandler();
const errorNames = [
	'name',
	'margin_up_to_BP',
	'EXW_price',
	'weight_in_kg',
	'MRP_markup',
	'RRP_markup',
	'margin_up_to_P2',
	'margin_up_to_P3',
	'margin_up_to_P4',
	'mark_up_contract'
];

const { create, update } = useCreateOrUpdate(matrixTypesService, errorNames, '/dashboard/matrix-types');

const saveOrUpdate = async selector => {
	isClicked = true;
	
    //console.log('Отправляемые данные:', sendData.value);
	const isValid = validate(isClicked, sendData.value);
	//console.log('Ошибки валидации:', errors.value);

	if (isValid) {
		return selector === 'save' ? await create(sendData.value) : await update(itemId.value, sendData.value);
	}
};

watch(matrixType.value, () => {
	disabled.value = false;
});

onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/matrix-types');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	if (isEditMode.value) {
		await sleep(1);
		store.commit('setLoading', true);
		matrixType.value = await matrixTypesService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg));

		store.commit('setLoading', false);
	}
});
</script>


<style scoped>
.main__inner+.main__inner {
    margin-top: 0px;
}
</style>