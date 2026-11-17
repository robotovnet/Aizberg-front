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
type="password"
v-model="inputPassword"
v-on:keyup.enter="changePassword"
class="auth-form__input input"
:placeholder="$t('text.new_password_placeholder')">
                <input tabindex="2"
type="password"
v-model="confirmPassword"
v-on:blur="validate"
v-on:keyup.enter="changePassword"
class="auth-form__input input"
:placeholder="$t('text.confirm_password_placeholder')">
                <button tabindex="3"
v-on:click="changePassword"
:disabled="disabled"
class="auth-form__btn btn">{{ $t('text.change_password_button') }}</button>
            </div>
            <p class="auth-form__message">{{ errMsg }}</p>
        </div>
     </main>
</template>

<script lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import getValidator from '../../../validation/getValidator';
import { MainState } from '../../../store/mainStore';
import fetchApi from '../../../network/fetchEndpoint';

export default {

	setup() {
		const localization = useI18n();
		const disabled = ref(true);
		const errMsg = ref('');
		const store = useStore<MainState>();
		const inputPassword = ref('');
		const confirmPassword = ref('');

		let redirectTo: string|undefined;

		const validate = () => {
			const validation = store.state.currentValidation;
			if (!validation) return;

			const data = {
				password: inputPassword.value,
				password_confirmation: confirmPassword.value,
			};
			const validator = getValidator(data, validation);
			if (validator?.fails()) errMsg.value = validator?.errors?.first('password')?.toString();
			else errMsg.value = '';
		};

		onMounted(() => {
			document.addEventListener('beforeunload', () => store.dispatch('recoverPassword/completed'));
			store.dispatch('recoverPassword/initStore');
			document.title += ` - ${localization.t('text.title')}`;
		});

		watch(() => store.state.recoverPassword.codeConfirmed, () => {
			if (store.state.recoverPassword.codeConfirmed === false) {
				if (redirectTo) window.location.replace(redirectTo!);
				else window.location.replace('/staff/password-recovery/first-step');
			}
		});

		watch(inputPassword, () => {
			disabled.value = (inputPassword.value.length === 0 || confirmPassword.value.length === 0
                    || inputPassword.value.length !== confirmPassword.value.length);
		});

		watch(confirmPassword, () => {
			disabled.value = (inputPassword.value.length === 0 || confirmPassword.value.length === 0
                    || inputPassword.value.length !== confirmPassword.value.length);
		});

		return {
			disabled,
			errMsg,
			inputPassword,
			confirmPassword,
			validate,
			changePassword: async () => {
				validate();
				disabled.value = true;
				if (errMsg.value) return;
				store.commit('setLoading', true);
				const response = await fetchApi(localization, err => {
					errMsg.value = err;
				}, axios => axios.post('staff/password-recovery/third-step', {
					password: inputPassword.value,
					password_confirmation: confirmPassword.value,
				}));
				if (response.redirect_to) {
					redirectTo = response.redirect_to;
					store.dispatch('recoverPassword/completed');
				} else store.commit('setLoading', false);
				disabled.value = false;
			},
		};
	},
};

</script>
