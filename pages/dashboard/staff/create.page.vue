<template>
	<AppPage :title="$t('text.header')" :can-edit="canEdit" v-if="canEdit">
		<div class="main__sub"></div>
		<div class="main__content" v-if="true">
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors.errors?.first_name"
					v-model="staff.first_name"
					:title="$t('text.form_first_name')"
					@validate="validate"></app-page-input>
			</div>
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors.errors?.last_name"
					v-model="staff.last_name"
					:title="$t('text.form_last_name')"
					@validate="validate"></app-page-input>
			</div>
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors.errors?.email"
					v-model="staff.email"
					:title="$t('text.form_email')"
					@validate="validate"></app-page-input>
			</div>
			<div class="main__inner main__inner--short">
				<span v-for="error in errors.errors?.phone" class="main__error main__error-message" v-html="error" />
				<span class="main__text">{{ $t('text.form_phone') }}</span>
				<input
					ref="inpt"
					type="tel"
					class="main__input input"
					autocomplete="off"
					inputmode="tel"
					:placeholder="phoneMask.replace('{', '').replace('}', '')" />
			</div>
			<div class="main__inner main__inner--short">
				<span v-for="error in errors.errors?.groups" class="main__error main__error-message" v-html="error" />
				<span class="main__text">{{ $t('text.form_staff_group') }}</span>

				<select class="main__select select" :class="{ 'select--error': !!errors.errors?.groups }" v-model="staff.groups">
					<option
						:value="group.id"
						v-for="group in groups.map(item => {
							return { id: item.id, name: item.name };
						})">
						{{ group.name }}
					</option>
				</select>
			</div>
			<div class="main__inner main__inner--short">
				<app-page-input
					type="password"
					:errors="errors.errors?.password"
					v-model="staff.password"
					:title="$t('text.form_password')"
					@validate="validate"></app-page-input>
			</div>
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors.errors?.max"
					v-model="staff.max"
					:title="$t('text.form_max')"
					@validate="validate"></app-page-input>
			</div>
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors.errors?.whatsapp"
					v-model="staff.whatsapp"
					:title="$t('text.form_whatsapp')"
					@validate="validate"></app-page-input>
			</div>
			<div class="main__inner main__inner--short">
				<app-page-input
					:errors="errors.errors?.telegram"
					v-model="staff.telegram"
					:title="$t('text.form_telegram')"
					@validate="validate"></app-page-input>
			</div>
			<div class="main__inner main__inner--end">
				<label for="avatar-upload" class="avatar">
					<input type="file" id="avatar-upload" @change="imageInput($event)" class="avatar__input" />
					<span class="avatar__text">{{ $t('text.form_avatar') }}</span>
					<div class="avatar__img">
						<img :src="previewImage ? previewImage : staff.userpic_name ? imgPath + staff.userpic_name : defaultImg" alt="" />
					</div>
					<span class="avatar__btn btn">{{ $t('text.form_choose_avatar_button_text') }}</span>
				</label>
			</div>
			<div class="main__inner main__inner--end">
				<button class="btn" @click="save">{{ $t('text.form_add_user_button_text') }}</button>
			</div>
		</div>
	</AppPage>
</template>

<script lang="ts">
import { inject, ref, watch, onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { MainState } from '../../../store/mainStore';
import { computed } from '@vue/runtime-core';
import getValidator from '../../../validation/getValidator';
import { IMG_PATH, DEFAULT_PIC } from '../../../utils/constants';
import IMask from 'imask';
import imageService from '../../../services/imageService';
import AppPageInput from '../../_components/AppPageInput.vue';
import AppPhoneInput from '../../_components/AppPhoneInput.vue';
import staffService from '../../../services/staffService';
import staffGroupService from '../../../services/staffGroupService';
import viewPermissions from '../../../utils/viewPermissions';
import redirect from '../../../utils/redirect';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';

export default {
	components: { AppPageInput, AppPhoneInput },
	setup() {
		const toast = inject('toast') as any;
		const localization = useI18n();
		const store = useStore<MainState>();
		const imgPath = ref(IMG_PATH);
		const defaultImg = ref(DEFAULT_PIC);
		const groups = ref([]);
		let errors = ref({});
		const inpt = ref();
		let staff = ref({
			first_name: '',
			last_name: '',
			email: '',
			phone: '',
			groups: [],
			password: '',
			max: '',
			whatsapp: '',
			telegram: '',
		});

		let previewImage: any = ref('');
		let imageData: any = null;
		const imageInput = (e: any) => {
			const image = e.target.files[0];
			const reader = new FileReader();
			reader.readAsDataURL(image);
			reader.onload = e => {
				previewImage.value = e.target?.result;
			};
			let formData = new FormData();
			formData.append('userpic', image);
			imageData = formData;
		};
		const { canEdit, canView } = usePageInit('staff');
		const createValidator = () => {
			let dbPhone = staff.value.phone.replace(/[^0-9]/g, '');
			const validation: any = store.state.currentValidation;
			const toValidate: any = {
				first_name: staff.value.first_name,
				last_name: staff.value.last_name,
				email: staff.value.email,
				phone: dbPhone,
				groups: staff.value.groups,
				password: staff.value.password,
				max: staff.value.max,
				whatsapp: staff.value.whatsapp,
				telegram: staff.value.telegram,
			};
			return getValidator(toValidate, validation);
		};

		let isClicked = ref(false);
		const validate = () => {
			if (isClicked.value) {
				const validator: any = createValidator();
				if (validator.fails()) {
					errors.value = validator.errors;
					return;
				} else {
					errors.value = [];
				}
				return true;
			}
		};

		const toasterErrorMessage = error => {
			return toast.error(error, {
				duration: 4000,
				dismissible: true,
				position: 'bottom',
			});
		};

		const save = async () => {
			isClicked.value = true;
			let groups = [];
			groups.push(staff.value.groups);
			store.commit('setLoading', true);
			if (!validate()) {
				store.commit('setLoading', false);
				return;
			}
			let user = await staffService.createStaff(
				localization,
				{
					first_name: staff.value.first_name,
					last_name: staff.value.last_name,
					email: staff.value.email,
					phone: staff.value.phone.replace(/[^0-9]/g, ''),
					groups: groups,
					password: staff.value.password,
					max: staff.value.max,
					whatsapp: staff.value.whatsapp,
					telegram: staff.value.telegram,
				},
				(errMsg, _, type) => {
					errors.value = { errors: { ...errors.value?.errors, [type]: [errMsg] } };
					store.commit('setLoading', false);
					return;
				},
			);
			let imgErrMsg = true;
			if (user.message === 'success' && imageData !== null) {
				await imageService.saveImage(localization, user.id, imageData, errMsg => {
					toasterErrorMessage(errMsg);
					imgErrMsg = false;
					store.commit('setLoading', false);
					return;
				});
			}
			store.commit('setLoading', false);
			if (user.message === 'success' && imgErrMsg) window.location.replace('/dashboard/staff');
		};
		const phoneMask = computed(() => store.state.currentValidation?.masks?.phone || '+{7} (000) 000-00-00');
		let phoneMaskInstance: ReturnType<typeof IMask> | null = null;

		const initPhoneMask = () => {
			if (!inpt.value || phoneMaskInstance) {
				return;
			}
			phoneMaskInstance = IMask(inpt.value, {
				mask: phoneMask.value,
				prepare: function (appended, masked) {
					if (masked.mask === '+{7} (000) 000-00-00') {
						if (appended === '8' && masked.value === '') {
							return '';
						}

						if (appended === '7' && masked.value === '') {
							return '';
						}

						if (appended === '8' && masked.value === '+7 (') {
							return '';
						}

						if (appended === '7' && masked.value === '+7 (') {
							return '';
						}
					}

					return appended;
				},
			});
			phoneMaskInstance.on('accept', () => {
				staff.value.phone = phoneMaskInstance?.value ?? '';
			});
		};

		onBeforeMount(async () => {
			if (!canEdit.value) redirect('/dashboard/staff');
			store.commit('setLoading', true);
			groups.value = await staffGroupService.getGroups(localization, errMsg => toasterErrorMessage(errMsg));
			store.commit('setLoading', false);
		});

		onMounted(() => {
			document.title += ' - ' + localization.t('text.header');
			initPhoneMask();
		});

		onBeforeUnmount(() => {
			phoneMaskInstance?.destroy();
			phoneMaskInstance = null;
		});

		return {
			inpt,
			canEdit,
			save,
			validate,
			staff,
			errors,
			groups,
			imgPath,
			defaultImg,
			previewImage,
			imageInput,
			phoneMask: computed(() => store.state.currentValidation?.masks?.phone || ''),
		};
	},
};
</script>
