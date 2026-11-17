<template>
	<main class="main">
		<div class="main__top main__top--center">
			<h1>{{ $t('text.header') }}</h1>
		</div>
		<div class="main__sub"></div>
		<div class="auth-form">
			<div class="auth-form__wrapper">
				<a v-bind:style="{ cursor: 'pointer' }" v-on:click="toggleLoginType" class="auth-form__link link">{{ loginBy }}</a>
				<InputEmailOrPhone
					:validation="validation"
					v-model:text="inputLogin"
					:inputType="loginType"
					:phoneMask="phoneMask"
					:errMsg="errLogin"
					:onEnter="onLogin" />
				<input
					tabindex="2"
					v-model="inputPassword"
					v-on:keydown="filterPasswordKeys"
					type="password"
					class="auth-form__input input"
					:class="clsErr"
					:placeholder="$t('text.password_placeholder')" />
				<span class="auth-form__error" v-html="errPassword" />
				<div />
				<button tabindex="3" :disabled="disabled" v-on:click="onLogin" class="auth-form__btn btn">
					{{ $t('text.login_button') }}
				</button>
				<a href="/staff/password-recovery/first-step" class="auth-form__link auth-form__link--right link">{{
					$t('text.forgot_password')
				}}</a>
			</div>
		</div>
	</main>
</template>

<script lang="ts">
import { computed, onMounted, watch } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { ref, getCurrentInstance } from 'vue';
import { InputType } from '../../../store/InputType';
import clearInput from '../../../validation/phone/clearInput';
import InputEmailOrPhone from '../../_components/InputEmailOrPhone.vue';
import { MainState } from '../../../store/mainStore';
import getValidator from '../../../validation/getValidator';
import filterValidation from '../../../validation/filterValidation';
import { authCookie } from '../../../middleware/processAuthentication';
import fetchApi from '../../../network/fetchEndpoint';

export default {
	components: {
		InputEmailOrPhone,
	},
	setup() {
		const localization = useI18n();
		const inputLogin = ref('');
		const inputPassword = ref('');
		const errLogin = ref('&nbsp;');
		const errPassword = ref('&nbsp;');
		const disabled = ref(true);
		const store = useStore<MainState>();

		const loginValidator = () => {
			const validation = store.state.currentValidation;
			if (validation) {
				const data =
					store.state.login.loginType == InputType.ByPhone
						? { phone: clearInput(inputLogin.value).substring(1) }
						: { email: inputLogin.value };
				return getValidator(data as any, filterValidation(['password'], validation));
			}
			return undefined;
		};

		const passwordValidator = () => {
			const validation = store.state.currentValidation;

			if (validation) {
				return getValidator({ password: inputPassword.value }, filterValidation(['email', 'phone'], validation));
			}
			return undefined;
		};
		const refer = ref();
		const login = async (path: string, type: string, username: string, password: string) => {
			const loginInfo = await fetchApi(
				localization,
				(err, code) => {
					errPassword.value = code === 429 ? localization.t('text.too_many_attempts') : err;
				},
				axios =>
					axios.post(path, {
						[type]: username,
						password,
					}),
			);

			const urlParams = new URLSearchParams(window.location.search);
			const redirectUrl = urlParams.get('redirectUrl');

			if (loginInfo.redirect_to) {
				document.cookie = authCookie(loginInfo.session_id);
				
				if (loginInfo.redirect_to == '/dashboard/sales/orders' ||
				   loginInfo.redirect_to == '/dashboard/sales/one-click-order' ||
				   loginInfo.redirect_to == '/dashboard/sales/clients'
				  ) {
					localStorage.setItem('main_bar_state', '1_sales');
				} else {
					localStorage.setItem('main_bar_state', '1_settings');
				}
				
				window.location.replace(loginInfo.redirect_to);
				
			} else store.commit('setLoading', false);
		};

		const onLogin = async () => {
			const lv = loginValidator();
			if (lv?.fails()) {
				errLogin.value =
					store.state.login.loginType == InputType.ByPhone
						? lv?.errors?.first('phone')?.toString() || localization.t('text.invalid_phone')
						: lv?.errors?.first('email')?.toString() || localization.t('text.invalid_email');
				disabled.value = true;
				return;
			}
			const pv = passwordValidator();
			if (pv?.fails() || (inputPassword.value.length < 6 || inputPassword.value.length > 20)) {
				errPassword.value = pv?.errors?.first('password')?.toString() || localization.t('text.invalid_password');
				disabled.value = true;
				return;
			}

			errPassword.value = '&nbsp;';
			disabled.value = true;
			if (inputPassword.value.length === 1) {
				errPassword.value = localization.t('text.invalid_password');
				return;
			}
			store.commit('setLoading', true);

			if (store.state.login.loginType == InputType.ByPhone) {
				await login('staff/login-by-phone', 'phone', clearInput(inputLogin.value).substring(1), inputPassword.value);
			} else if (store.state.login.loginType == InputType.ByEmail) {
				await login('staff/login-by-email', 'email', inputLogin.value, inputPassword.value);
			}
			disabled.value = false;
		};

		watch(inputLogin, () => {
			disabled.value = inputLogin.value.trim().length == 0 || inputPassword.value.length == 0;
		});

		watch(inputPassword, () => {
			disabled.value = inputLogin.value.trim().length == 0 || inputPassword.value.length == 0;
		});

		onMounted(async () => {
			store.dispatch('login/initStore');
			document.title += ` - ${localization.t('text.title')}`;
		});

		return {
			disabled,
			errLogin,
			errPassword,
			inputLogin,
			inputPassword,
			clsErr: computed(() => (errPassword.value !== '&nbsp;' ? 'input--error' : '')),
			validation: computed(() => filterValidation(['password'], store.state.currentValidation)),
			phoneMask: computed(() => store.state.currentValidation?.masks?.phone || ''),
			toggleLoginType: () => {
				if (store.state.login.loginType == InputType.ByPhone) store.dispatch('login/setLoginType', InputType.ByEmail);
				else store.dispatch('login/setLoginType', InputType.ByPhone);
				errPassword.value = '&nbsp;';
				inputPassword.value = '';
			},
			onLogin,
			loginBy: computed(() => {
				switch (store.state.login.loginType) {
					case InputType.ByPhone:
						return localization.t('text.login_by_email');
					case InputType.ByEmail:
						return localization.t('text.login_by_phone');
				}
			}),
			filterPasswordKeys: (evnt: any) => {
				const keyCode = evnt.which || evnt.keyCode;
				errPassword.value = '&nbsp;';
				if (keyCode == 13) onLogin();
			},
			loginType: computed(() => store.state.login.loginType),
		};
	},
};
</script>
