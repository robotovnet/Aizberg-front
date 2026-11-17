<template>
	<main class="main">
		<div class="main__top">
			<h1>{{ $t('text.header') }}</h1>
		</div>
		<div class="main__sub"></div>
		<div class="main__content main__content--column">
			<div class="main__wrapper main__wrapper--profile">
				<div class="main__inner main__inner--short">
					<span
						:key="index"
						v-for="(error, index) in nameErrors.errors?.first_name"
						class="main__error main__error-message"
						v-html="error" />
					<span class="main__text">{{ $t('text.first_name') }}</span>
					<div class="main__block main__block--full">
						<input
							v-model="profile.first_name"
							autocomplete="off"
							@input="nameValidator"
							type="text"
							class="main__input input" />
					</div>
				</div>
				<div class="main__inner main__inner--short">
					<span
						:key="index"
						v-for="(error, index) in nameErrors.errors?.last_name"
						class="main__error main__error-message"
						v-html="error" />
					<span class="main__text">{{ $t('text.last_name') }}</span>
					<div class="main__block main__block--full">
						<input
							v-model="profile.last_name"
							autocomplete="off"
							@input="nameValidator"
							type="text"
							class="main__input input" />
					</div>
				</div>
				<div class="main__inner main__inner--end">
					<button @click="amendName" class="btn">{{ $t('text.amend_name') }}</button>
				</div>
				<div class="main__inner main__inner--short">
					<span
						:key="index"
						v-for="(error, index) in emailErrors.errors?.email"
						class="main__error main__error-message"
						v-html="error" />
					<span class="main__text">{{ $t('text.email') }}</span>
					<div class="main__block main__block--full">
						<div class="email">{{ profile.email }}</div>
						<button :disabled="isSendEmailButtonDisabled" @click="amendEmail" class="btn modal-btn">
							{{
								store.state.profileModule.isEmailTimerGoing ? store.state.profileModule.emailTimer : $t('text.amend_email')
							}}
						</button>
					</div>
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.phone') }}</span>
					<div class="main__block main__block--full">
						<span
							:key="index"
							v-for="(error, index) in phoneErrors.errors?.phone"
							class="main__error main__error-message"
							v-html="error" />
						<div class="email">{{ profile.phone }}</div>
						<button :disabled="isSendPhoneButtonDisabled" @click="amendPhone" class="btn">
							{{
								store.state.profileModule.isPhoneTimerGoing ? store.state.profileModule.phoneTimer : $t('text.amend_phone')
							}}
						</button>
					</div>
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">WhatsApp</span>
					<div class="main__block main__block--full">
						<input
							v-model="profile.whatsapp"
							autocomplete="off"
							type="text"
							class="main__input input"
							placeholder="WhatsApp номер" />
					</div>
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">Telegram</span>
					<div class="main__block main__block--full">
						<input
							v-model="profile.telegram"
							autocomplete="off"
							type="text"
							class="main__input input"
							placeholder="Telegram username" />
					</div>
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">Max</span>
					<div class="main__block main__block--full">
						<input
							v-model="profile.max"
							autocomplete="off"
							type="text"
							class="main__input input"
							placeholder="Max контакт" />
					</div>
				</div>
				<div class="main__inner main__inner--end">
					<button @click="amendName" class="btn">{{ $t('text.update_im') }}</button>
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.set_new_password') }}</span>
					<div class="main__block main__block--full">
						<input
							type="password"
							v-model="inputCurrentPassword"
							@input="passwordValidator"
							class="main__input input"
							:placeholder="$t('text.currennt_password_placeholder')" />
						<button class="btn" style="visibility: hidden" />
					</div>
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text"></span>
					<div class="main__block main__block--full">
						<input
							type="password"
							v-model="inputNewPassword"
							@input="passwordValidator"
							class="main__input input"
							:placeholder="$t('text.new_password_placeholder')" />
						<button class="btn" style="visibility: hidden" />
					</div>
				</div>
				<div class="main__inner main__inner--short">
					<span class="main__text"></span>
					<span
						class="main__error main__error-message"
						v-html="passwordErrors.errors?.password[0] ? passwordErrors.errors?.password[0] : ''" />
					<div class="main__block main__block--full">
						<input
							v-model="inputConfirmPassword"
							type="password"
							@input="passwordValidator"
							class="main__input input"
							:placeholder="$t('text.confirm_password_placeholder')" />
						<button v-on:click="updatePassword" class="btn">{{ $t('text.change_password') }}</button>
					</div>
				</div>
				<div class="main__inner main__inner--short main__inner--bottom">
					<span class="main__text">{{ $t('text.pick_avatar') }}</span>
					<label for="avatar-upload" class="avatar avatar--long">
						<input type="file" id="avatar-upload" class="avatar__input" @change="imageInput($event)" />
						<div class="avatar__img">
							<img
								alt="Avatar"
								:src="previewImage ? previewImage : profile.userpic_name ? imgPath + profile.userpic_name : defaultImg" />
						</div>
						<span class="avatar__btn btn">{{ $t('text.choose_avatar_button') }}</span>
					</label>
				</div>
			</div>
		</div>

		<app-change-email-popup
			@sendCodeEndEmail="sendCodeEndEmail"
			:show="emailPopup"
			@close="emailPopup = false"
			:emailValidation="emailValidation" />
		<app-change-phone-popup
			@sendCodeEndPhone="sendCodeEndPhone"
			:show="phonePopup"
			@close="phonePopup = false"
			:phoneValidation="phoneValidation">
		</app-change-phone-popup>
	</main>
</template>

<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { computed, onBeforeMount, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import profileService from '../../../services/profileService';
import AppPageInput from '../../_components/AppPageInput.vue';
import AppPhoneInput from '../../_components/AppPhoneInput.vue';
import AppChangeEmailPopup from '../../_components/dashboard/profile/AppChangeEmailPopup.vue';
import getValidator from '../../../validation/getValidator';
import { DEFAULT_PIC, IMG_PATH } from '../../../utils/constants';
import toaster from '../../../utils/toaster';
import AppChangePhonePopup from '../../_components/dashboard/profile/AppChangePhonePopup.vue';

const toast = inject('toast') as any;
const emailPopup = ref(false);
const phonePopup = ref(false);
const imgPath = ref(IMG_PATH);
const defaultImg = ref(DEFAULT_PIC);
const localization: any = useI18n();
const store = useStore<MainState>();
const inputCurrentPassword = ref('');
const inputNewPassword = ref('');
const inputConfirmPassword = ref('');
const profile = ref({
	first_name: '',
	last_name: '',
	email: '',
	phone: '',
	whatsapp: '',
	telegram: '',
	max: '',
	groups: [],
});
const nameErrors = ref({});
const emailErrors = ref([]);
const phoneErrors = ref([]);
const passwordErrors = ref([]);
const isSendEmailButtonDisabled = ref(false);
const isSendPhoneButtonDisabled = ref(false);
const timeRemain = ref(0);

const createValidator = (toValidate, validationName) => {
	const validation = store.state?.currentValidation;
	if (validation) return getValidator(toValidate, validation[validationName]);
};

const emailTimer = computed(() => store.state.profileModule.emailTimer);

const nameValidator = () => {
	const validator: any = createValidator(
		{
			first_name: profile.value.first_name,
			last_name: profile.value.last_name,
			whatsapp: profile.value.whatsapp,
			telegram: profile.value.telegram,
			max: profile.value.max,
		},
		'ProfileUpdateName',
	);
	if (validator.fails()) {
		nameErrors.value = validator.errors;
		return;
	}
	nameErrors.value = [];

	return true;
};

const emailValidation = ref({});
const emailValidator = () => {
	const validator: any = createValidator({ email: profile.value.email }, 'ProfileUpdateEmail');
	if (validator.fails()) {
		emailErrors.value = validator.errors;
		return;
	}
	emailErrors.value = [];

	return true;
};

const phoneValidation = ref({});
const phoneValidator = () => {
	const validator: any = createValidator({ phone: profile.value.phone }, 'ProfileUpdatePhone');
	if (validator.fails()) {
		phoneErrors.value = validator.errors;
		return;
	}
	phoneErrors.value = [];
	
	return true;
};

const previewImage: any = ref('');
let imageData: any = null;
const imageInput = async (e: any) => {
	const image = e.target.files[0];
	const reader = new FileReader();
	reader.readAsDataURL(image);
	reader.onload = e => {
		previewImage.value = e.target?.result;
	};
	imageData = new FormData();
	imageData.set('userpic', image);
	if (imageData !== null) {
		store.commit('setLoading', true);
		let error: any = null;
		await profileService.saveUserpic(localization, imageData, errMsg => {
			error = errMsg;
			toaster.error(toast, errMsg);
		});
		if (error === null) {
			await store.dispatch('setProfileAction');
			toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		}
		store.commit('setLoading', false);
	}
};

const amendEmail = async () => {
	emailPopup.value = !emailPopup.value;
	if (!store.state.profileModule.isEmailTimerGoing) {
		store.commit('setLoading', true);
		store.dispatch('profileModule/startEmailTimer', 120);
		// disabled.value = true;
		const mailCode = await profileService.sendCodeToEmail(localization, errMsg => {
			if (errMsg === 'Too Many Attempts.') {
				toaster.error(toast, `Код подтверждения можно отправить через ${store.state.profileModule.emailTimer}`);
			} else {
				toaster.error(toast, errMsg);
			}
		});
		if (mailCode.message) toaster.success(toast, mailCode.message);
		store.commit('setLoading', false);
	}
};
watch(
	() => store.state.profileModule.isEmailTimerGoing,
	async () => {
		if (!store.state.profileModule.isEmailTimerGoing) {
			isSendEmailButtonDisabled.value = false;
		}
	},
);
const sendCodeEndEmail = async data => {
	store.commit('setLoading', true);
	const emailCode = await profileService.sendCodeWithEmail(localization, data, (errMsg, _, type) => {
		if (errMsg === 'Too Many Attempts.') {
			toaster.error(toast, 'Превышено количество попыток.');
			emailPopup.value = false;
			isSendEmailButtonDisabled.value = true;
		} else {
			toaster.error(toast, errMsg);
		}
		store.commit('profileModule/isCodeCorrect', false);
	});

	if (emailCode.message === 'success') {
		store.commit('profileModule/isCodeCorrect', true);
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		await store.dispatch('setProfileAction');
		profile.value = store.state.userProfile as any;
		emailPopup.value = false;
	}
	store.commit('setLoading', false);
};

const amendPhone = async () => {
	phonePopup.value = !phonePopup.value;
	if (!store.state.profileModule.isPhoneTimerGoing) {
		store.dispatch('profileModule/startPhoneTimer', 120);
		store.commit('setLoading', true);
		const phoneCode = await profileService.sendCodeToPhone(localization, errMsg => {
			if (errMsg === 'Too Many Attempts.') {
				toaster.error(toast, `Код подтверждения можно отправить через ${store.state.profileModule.phoneTimer}`);
			} else {
				toaster.error(toast, errMsg);
			}
		});
		if (phoneCode.message) toaster.success(toast, phoneCode.message);
		store.commit('setLoading', false);
	}
};
watch(
	() => store.state.profileModule.isPhoneTimerGoing,
	async () => {
		if (!store.state.profileModule.isPhoneTimerGoing) {
			isSendPhoneButtonDisabled.value = false;
		}
	},
);
const sendCodeEndPhone = async data => {
	store.commit('setLoading', true);
	const phoneCode = await profileService.sendCodeWithPhone(localization, data, (errMsg, _, type) => {
		if (errMsg === 'Too Many Attempts.') {
			toaster.error(toast, 'Превышено количество попыток.');
			phonePopup.value = false;
			isSendPhoneButtonDisabled.value = true;
		} else {
			toaster.error(toast, errMsg);
		}
		store.commit('profileModule/isCodeCorrect', false);
	});

	if (phoneCode.message === 'success') {
		store.commit('profileModule/isCodeCorrect', true);
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		await store.dispatch('setProfileAction');
		profile.value = store.state.userProfile as any;
		phonePopup.value = false;
	}
	store.commit('setLoading', false);
};

const amendName = async () => {
	store.commit('setLoading', true);
	const response = await profileService.saveName(
		localization as any,
		{
			first_name: profile.value.first_name,
			last_name: profile.value.last_name,
			whatsapp: profile.value.whatsapp,
			telegram: profile.value.telegram,
			max: profile.value.max,
		},
		(errMsg, _, type) => {
			nameErrors.value = { errors: { ...errors.value?.errors, [type as any]: [errMsg] } };
			store.commit('setLoading', false);
		},
	);
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
	}
	store.commit('setLoading', false);
};
const passDelay = ref(false);
const passwordValidator = () => {
	if (passDelay.value) {
		const validator: any = createValidator(
			{
				current_password: inputCurrentPassword.value,
				password: inputNewPassword.value,
				password_confirmation: inputConfirmPassword.value,
			},
			'ProfileUpdatePassword',
		);
		if (validator.fails()) {
			passwordErrors.value = validator.errors;
			return false;
		}
		passwordErrors.value = [];

		return true;
	}
	return false;
};
const updatePassword = async () => {
	passDelay.value = true;
	if (passwordValidator()) {
		store.commit('setLoading', true);
		const response = await profileService.updatePassword(
			localization,
			{
				current_password: inputCurrentPassword.value,
				password: inputNewPassword.value,
				password_confirmation: inputConfirmPassword.value,
			},
			errMsg => toaster.error(toast, errMsg),
		);

		if (response.message === 'success') {
			toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		}
		store.commit('setLoading', false);
	}
};
onBeforeMount(async () => {
	store.commit('setLoading', true);
	profile.value = store.state.userProfile as any;
	emailValidation.value = store.state.currentValidation?.ProfileUpdateEmail;
	phoneValidation.value = store.state.currentValidation?.ProfileUpdatePhone;
	store.commit('setLoading', false);
});

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
	store.dispatch('profileModule/initStore');
});

const phoneMask = computed(() => store.state.currentValidation?.masks?.phone || '');
</script>
<style scoped>
.email {
	width: 100%;
}
</style>
