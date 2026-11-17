<template>
	<AppPage :title="$t('text.header_edit')" :can-edit="canEdit" v-if="canEdit">
		<div class="main__sub"></div>
		<div class="main__content" v-if="true">
			<div class="main__inner main__inner--short">
				<span class="main__text"> {{ $t('text.form_first_name') }}</span>
				<input v-model="staff.first_name" @input="validate" type="text" class="main__input input" />
				<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['vendor_code']" />
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
					v-if="staff.phone"
					ref="inpt"
					type="text"
					class="main__input input"
					:disabled="disabled"
					:placeholder="phoneMask.replace('{', '').replace('}', '')" />
			</div>
			<div class="main__inner main__inner--short">
				<span v-for="error in errors.errors?.groups" class="main__error main__error-message" v-html="error" />
				<span class="main__text">{{ $t('text.form_staff_group') }}</span>

				<select
					class="main__select select"
					:class="{ 'select--error': !!errors.errors?.groups }"
					v-model="currentGroup"
					@change="validate">
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
				<button class="btn" @click="update">
					{{ $t('text.form_change_user_data_button_text') }}
				</button>
			</div>
			<div class="main__inner main__inner--short">
				<span>{{ $t('text.form_password') }}</span>
				<input v-model="newPassword" type="text" class="main__input input" placeholder="Введите пароль" @input="passwordValidate" />
				<span class="main__error main__error-message" v-html="passwordErrors.password" />
			</div>
			<div class="main__inner main__inner--end">
				<button class="btn" :disabled="!newPassword" @click="updatePassword">
					{{ $t('text.form_change_password_button_text') }}
				</button>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.change_user_avatar') }}</span>
				<label for="avatar-upload" class="avatar">
					<span v-for="error in imgErrors.errors?.userpic" class="main__error main__error-message" v-html="error" />
					<input type="file" id="avatar-upload" @change="imageInput($event)" class="avatar__input" />
					<div class="avatar__img">
						<img
							:src="previewImage ? previewImage : staff.userpic_name ? imgPath + staff.userpic_name : defaultImg"
							alt="Avatar" />
					</div>
					<span class="avatar__btn btn">{{ $t('text.form_choose_avatar_button_text') }}</span>
				</label>
			</div>
			<div class="main__inner">
				<button class="btn btn--red" @click="blockUser">
					{{ $t(staff.is_blocked === 'Y' ? 'text.form_block_user_button_text_unblock' : 'text.form_block_user_button_text') }}
				</button>
			</div>
		</div>
	</AppPage>
</template>

<script lang="ts">
import { inject, ref, onBeforeMount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import IMask from 'imask';
import { MainState } from '../../../../store/mainStore';
import getValidator from '../../../../validation/getValidator';
import { IMG_PATH, DEFAULT_PIC } from '../../../../utils/constants';
import AppPageInput from '../../../_components/AppPageInput.vue';
import AppPhoneInput from '../../../_components/AppPhoneInput.vue';
import staffService from '../../../../services/staffService';
import imageService from '../../../../services/imageService';
import staffGroupService from '../../../../services/staffGroupService';
import viewPermissions from '../../../../utils/viewPermissions';
import sleep from '../../../../utils/sleep';
import toaster from '../../../../utils/toaster';
import phoneMask from '../../../../validation/phone/phoneMask';
import redirect from '../../../../utils/redirect';
import usePageInit from '../../../../composables/pages/dashboard/usePageInit';

export default {
	components: { AppPageInput, AppPhoneInput },
	props: {
		staffId: {
			default: 0,
			required: true,
		},
	},

	setup(props) {
		const inpt = ref();
		const toast = inject('toast') as any;
		const localization: any = useI18n();
		const store = useStore<MainState>();
		const imgPath = ref(IMG_PATH);
		const defaultImg = ref(DEFAULT_PIC);
		const groups = ref([]);
		const errors = <any>ref({});
		const imgErrors = ref({});
		const currentGroup = <any>ref(0);
		const staff = <any>ref({
			first_name: '',
			last_name: '',
			email: '',
			phone: '',
			groups: [],
			max: '',
			whatsapp: '',
			telegram: '',
		});
		const userPhone = ref();
		const disabled = ref(false);

		const validate = () => {
			const validator = getValidator(
				{
					first_name: staff.value.first_name,
					last_name: staff.value.last_name,
					email: staff.value.email,
					phone: inpt.value.value.replace(/[^0-9]/g, ''),
					groups: currentGroup.value,
					max: staff.value.max,
					whatsapp: staff.value.whatsapp,
					telegram: staff.value.telegram,
				},
				store.state.currentValidation?.staffUpdate,
			);
			if (validator?.fails()) {
				errors.value = validator.errors;
				return;
			}
			errors.value = [];

			return true;
		};

		
		const { canEdit, canView } = usePageInit('staff');
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
				await imageService.saveImage(localization, staff.value.id, imageData, errMsg => {
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

		const update = async () => {
			console.log(inpt.value.value.replace(/[^0-9]/g, ''));
			if (!validate()) return;
			store.commit('setLoading', true);
			const groups: any = [];
			groups.push(currentGroup.value);
			let errMessage = '';
			console.log(inpt.value.value);
			await staffService.updateStaff(
				localization,
				staff.value.id as any,
				{
					first_name: staff.value.first_name,
					last_name: staff.value.last_name,
					email: staff.value.email,
					phone: inpt.value.value.replace(/[^0-9]/g, ''),
					groups,
					max: staff.value.max,
					whatsapp: staff.value.whatsapp,
					telegram: staff.value.telegram,
				},
				(errMsg, _, type) => {
					errMessage = errMsg;
					errors.value = { errors: { ...errors.value?.errors, [type as any]: [errMsg] } };
				},
			);
			if (!errMessage) {
				await store.dispatch('setProfileAction');
				toaster.success(toast, localization.t('text.update_user_data'));
			}
			store.commit('setLoading', false);
		};

		const newPassword = ref('');
		const passwordErrors: any = ref([]);
		const passwordValidate = () => {
			const validator = getValidator({ password: newPassword.value }, store.state.currentValidation?.staffSetPassword);
			if (validator && validator.fails()) {
				passwordErrors.value = validator.errors.errors;
				return false;
			}
			passwordErrors.value = [];
			return true;
		};

		const updatePassword = async () => {
			if (!passwordValidate()) return;
			store.commit('setLoading', true);
			await staffService.updatePassword(localization, staff.value.id, { password: newPassword.value }, errMsg => {
				toaster.error(toast, errMsg);
			});

			newPassword.value = '';
			toaster.success(toast, localization.t('text.update_password'));
			store.commit('setLoading', false);
		};

		const blockUser = async () => {
			store.commit('setLoading', true);
			if (staff.value.is_blocked === 'Y') {
				const response = await staffService.unBlockStaff(localization, staff.value.id, errMsg => {
					toaster.error(toast, errMsg);
				});
				staff.value.is_blocked = 'N';
				if (response.message === 'success') {
					toaster.success(toast, 'Пользователь разблокирован');
				}
			} else {
				const response = await staffService.blockStaff(localization, staff.value.id, errMsg => {
					toaster.error(toast, errMsg);
				});
				staff.value.is_blocked = 'Y';
				if (response.message === 'success') {
					toaster.success(toast, 'Пользователь заблокирован');
				}
			}
			store.commit('setLoading', false);
		};
		const phoneMask = computed(() => store.state.currentValidation?.masks?.phone || '+{7} (000) 000-00-00');
		watch(
			async () => store.state.ready,
			async () => {},
		);

		const phoneForSave = ref();
		onBeforeMount(async () => {
			if (!canEdit.value) redirect('/dashboard/staff');
			await sleep(1);
			store.commit('setLoading', true);
			Promise.all([
				staffGroupService.getGroups(localization, errMsg => toaster.error(toast, errMsg)),
				staffService.getStaff(localization, props.staffId, errMsg => toaster.error(toast, errMsg)),
			])
				.then(values => ([groups.value, staff.value] = [...values]))
				.then(() => {
					currentGroupHandler();
					const phone = staff.value.phone.slice(1);

					const mask = IMask(inpt.value, { 
							mask: '+7 (000) 000-00-00',
							prepare: function (appended, masked) {
								//console.log('appended: ' + appended);
								//console.log('masked.value: ' + masked.value);
								//console.log(masked);

								if (masked.mask === "+7 (000) 000-00-00") {
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
						}
					);
					
					mask.unmaskedValue = phone;
				})
				.then(() => store.commit('setLoading', false));
		});

		onMounted(() => {
			document.title += ` - ${localization.t('text.title_edit')}`;
		});

		const currentGroupHandler = () => (currentGroup.value = staff.value.groups.map(item => item.id).shift());

		return {
			disabled,
			userPhone,
			inpt,
			canEdit,
			blockUser,
			newPassword,
			passwordErrors,
			updatePassword,
			passwordValidate,
			validate,
			staff,
			errors,
			groups,
			currentGroup,
			imgErrors,
			imgPath,
			defaultImg,
			previewImage,
			imageInput,
			update,
			phoneMask,
		};
	},
};
</script>

<style scoped>
.avatar__img {
	cursor: pointer;
}
</style>
