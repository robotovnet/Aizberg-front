<template>
    <main class="main">
         <div class="main__top main__top--center">
            <h1>{{ $t('text.header') }}</h1>
        </div>
        <div class="main__sub"></div>
            <div class="auth-form">
                <p class="auth-form__description">{{ $t('text.direction') }}</p>
                <div class="auth-form__wrapper">
                    <input tabindex="1"
ref="inpt"
type="tel"
v-on:keyup.enter="onSubmit"
v-on:blur="validate"
v-model="inputCode"
class="auth-form__input input"
:class="clsErr"
:placeholder="$t('text.code_placeholder')">
                    <span class="auth-form__error"
v-html="errCode" />
                    <span />
                    <button tabindex="2"
:disabled="disabled"
v-on:click="onSubmit"
class="auth-form__btn btn">{{ $t('text.confirm_button') }}</button>
                    <p class="auth-form__help">{{ $t('text.expiring_timer') }} <span v-html="timer"/></p>
                </div>
            </div>
    </main>
</template>

<script lang="ts">
import {
	onMounted, watch, computed, ref,
} from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import IMask from 'imask';
import { MainState } from '../../../store/mainStore';
import getValidator from '../../../validation/getValidator';
import fetchApi from '../../../network/fetchEndpoint';

export default {
	setup() {
		const localization = useI18n();
		const store = useStore<MainState>();
		const inpt = ref();
		const inputCode = ref('');
		const errCode = ref('&nbsp;');
		const disabled = ref(true);

		let redirectTo;

		const validate = () => {
			const validation = store.state.currentValidation;
			if (!validation) return;
			const validator = getValidator({ code: inputCode.value }, validation);
			if (validator?.fails()) errCode.value = validator?.errors?.first('code')?.toString();
			else errCode.value = '&nbsp;';
		};

		onMounted(() => {
			store.dispatch('recoverPassword/initStore');
			document.title += ` - ${localization.t('text.title')}`;
		});

		watch(() => store.state.currentValidation, () => {
			const rules = store.state.currentValidation?.rules?.code || 'digits:6';
			const digits = parseInt(rules.substring(rules.indexOf('digits:') + 7));
			let mask = '';
			for (let i = 0; i < digits; i++) mask = mask.concat('0');

			const maskOptions = {
				mask,
			};
			IMask(inpt.value, maskOptions);
		});
		watch(() => store.state.recoverPassword.isOnGoing, () => {
			if (store.state.recoverPassword.isOnGoing === false) {
				if (redirectTo) window.location.replace(redirectTo!);
				else window.location.replace('/staff/password-recovery/first-step');
			}
		});
		watch(inputCode, () => {
			inputCode.value = inputCode.value.replace(/\D/g, '');
			if (inputCode.value.length > 6) inputCode.value = inputCode.value.substring(0, 6);
			disabled.value = inputCode.value.length === 0;
			errCode.value = '&nbsp;';
		});

		return {
			inputCode,
			inpt,
			errCode,
			disabled,
			clsErr: computed(() => ((errCode.value !== '&nbsp;') ? 'input--error' : '')),
			timer: computed(() => store.state.recoverPassword.timer),
			validate,
			onSubmit: async () => {
				validate();
				disabled.value = true;
				if (errCode.value != '&nbsp;') return;
				store.commit('setLoading', true);
				const response = await fetchApi(localization, err => {
					errCode.value = err;
				}, axios => axios.post('staff/password-recovery/second-step', {
					code: inputCode.value,
				}));
				if (response.redirect_to) {
					redirectTo = response.redirect_to;
					store.dispatch('recoverPassword/stopTimer');
				} else store.commit('setLoading', false);
				disabled.value = false;
			},
		};
	},
};
</script>
