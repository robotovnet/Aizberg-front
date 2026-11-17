<template>
	<main class="main">
		<div class="main__top main__top--center">
			<h1>{{ $t('text.header') }}</h1>
		</div>
		<div class="main__sub"></div>
		<div class="auth-form">
			<p class="auth-form__description">
				{{ enterAccount }}
				<a v-on:click="toggleRecoveryAccount" v-bind:style="{ cursor: 'pointer' }" class="link">{{ emailOrPhone }}</a>
				{{ $t('text.recovery_direction3') }}
			</p>
			<div class="auth-form__wrapper">
				<InputEmailOrPhone
					:validation="validation"
					v-model:text="inputRecoverAccount"
					:inputType="recoveryType"
					:phoneMask="phoneMask"
					v-model:errMsg="errAccountMsg"
					:onEnter="() => {}" />
			</div>
			<p class="auth-form__description">{{ $t('text.send_method') }}</p>
			<div class="auth-form__wrapper">
				<div class="auth-form__inner">
					<label id="email" for="send-code-email" class="checkbox-group auth-form__label" v-on:click="selectOption">
						<input id="email" tabindex="2" type="radio" value="email" class="checkbox-group__checkbox" v-model="sendTo" />
						<span id="email">{{ $t('text.send_email') }}</span>
					</label>
					<label id="sms" for="send-code-sms" class="checkbox-group auth-form__label" v-on:click="selectOption">
						<input id="sms" tabindex="3" type="radio" value="sms" class="checkbox-group__checkbox" v-model="sendTo" />
						<span id="sms">{{ $t('text.send_sms') }}</span>
					</label>
				</div>
				<div class="captcha" v-on:click="refreshCaptcha">
					<img v-on:click="refreshCaptcha" style="width: 100%; height: 100%" ref="image" :src="`${baseUrl}captcha/image`" />
				</div>
				<input
					tabindex="4"
					type="text"
					class="auth-form__input input"
					:class="clsErr"
					:placeholder="$t('text.captcha_placeholder')"
					v-model="captcha"
					v-on:keyup.enter="onSubmit" />
				<span class="auth-form__error" v-html="errCaptcha" />
				<span />
				<button tabindex="5" :disabled="disabled" class="auth-form__btn btn" v-on:click="onSubmit">
					{{ $t('text.recover_button') }}
				</button>
			</div>
		</div>
	</main>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { MainState } from '../../../store/mainStore';
import { InputType } from '../../../store/InputType';
import InputEmailOrPhone from '../../_components/InputEmailOrPhone.vue';
import filterValidation from '../../../validation/filterValidation';
import clearInput from '../../../validation/phone/clearInput';
import getValidator from '../../../validation/getValidator';
import fetchApi from '../../../network/fetchEndpoint';

export default {
	components: {
		InputEmailOrPhone,
	},
	setup() {
		const localization = useI18n();
		const store = useStore<MainState>();
		const inputRecoverAccount = ref('');
		const errAccountMsg = ref('&nbsp;');
		const errCaptcha = ref('&nbsp;');
		const captcha = ref('');
		const image = ref();
		const sendTo = ref('');
		const disabled = ref(true);
		const baseUrl = import.meta.env.VITE_API_URL;

		let redirectTo;

		const changeSendMethod = (loginType: InputType) => {
			if (loginType == InputType.ByEmail) sendTo.value = 'email';
			else sendTo.value = 'sms';
		};

		const validate = () => {
			disabled.value =
				inputRecoverAccount.value.length <= 1 ||
				captcha.value.trim().length < 1 ||
				errAccountMsg.value != '&nbsp;' ||
				errCaptcha.value != '&nbsp;';
		};

		onMounted(() => {
			store.dispatch('login/initStore');
			store.dispatch('recoverPassword/initStore');
			document.title += ` - ${localization.t('text.title')}`;
			changeSendMethod(store.state.login.loginType);
		});

		watch(inputRecoverAccount, validate);
		watch(captcha, () => {
			const validation = filterValidation(['email', 'phone'], store.state.currentValidation);
			const validator = getValidator({ captcha: captcha.value }, validation);
			if (validator?.fails()) errCaptcha.value = validator?.errors?.first('captcha')?.toString();
			else errCaptcha.value = '&nbsp;';
			validate();
		});
		watch(errAccountMsg, validate);
		watch(errCaptcha, validate);
		watch(
			() => store.state.login.loginType,
			() => changeSendMethod(store.state.login.loginType),
		);
		watch(
			() => store.state.recoverPassword.isOnGoing,
			() => {
				if (store.state.recoverPassword.isOnGoing === true)
					window.location.replace(redirectTo || '/staff/password-recovery/second-step');
			},
		);

		return {
			baseUrl,
			errCaptcha,
			sendTo,
			errAccountMsg,
			inputRecoverAccount,
			captcha,
			disabled,
			image,
			clsErr: computed(() => (errCaptcha.value !== '&nbsp;' ? 'input--error' : '')),
			recoveryType: computed(() => store.state.login.loginType),
			validation: computed(() => filterValidation(['captcha'], store.state.currentValidation)),
			phoneMask: computed(() => store.state.currentValidation?.masks?.phone || ''),
			enterAccount: computed(() =>
				store.state.login.loginType == InputType.ByEmail
					? localization.t('text.recovery_direction1_1')
					: localization.t('text.recovery_direction1_2'),
			),
			emailOrPhone: computed(() =>
				store.state.login.loginType == InputType.ByEmail
					? localization.t('text.recovery_direction2_1')
					: localization.t('text.recovery_direction2_2'),
			),
			toggleRecoveryAccount: () => {
				if (store.state.login.loginType == InputType.ByEmail) store.dispatch('login/setLoginType', InputType.ByPhone);
				else store.dispatch('login/setLoginType', InputType.ByEmail);
			},
			onSubmit: async () => {
				if (disabled.value) return;
				errCaptcha.value = '&nbsp;';
				const accountType = store.state.login.loginType == InputType.ByEmail ? 'email' : 'phone';
				const section = sendTo.value == 'email' ? 'by-email' : 'by-phone';
				const path = `staff/password-recovery/${section}/first-step`;
				const clearAccount =
					store.state.login.loginType == InputType.ByPhone
						? clearInput(inputRecoverAccount.value).substring(1)
						: inputRecoverAccount.value;
				const data = {
					[accountType]: clearAccount,
					captcha: captcha.value.trim(),
				};
				disabled.value = true;
				store.commit('setLoading', true);
				const response = await fetchApi(
					localization,
					(err, _, type) => {
						switch (type) {
							case 'email':
							case 'phone':
								errAccountMsg.value = err;
								break;
							default:
								errCaptcha.value = err;
								break;
						}
					},
					axios => axios.post(path, data),
					['email', 'phone', 'captcha'],
				);
				if (response.redirect_to) {
					redirectTo = response.redirect_to;
					store.dispatch('recoverPassword/startTimer');
				} else store.commit('setLoading', false);
				image.value.src = `${baseUrl}captcha/image?${new Date().getTime()}`;
				disabled.value = false;
			},
			selectOption: event => {
				sendTo.value = event.target.id;
			},
			refreshCaptcha: () => {
				image.value.src = `${baseUrl}captcha/image?${new Date().getTime()}`;
			},
		};
	},
};
</script>
