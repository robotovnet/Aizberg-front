<template>
	<div>
		<div class="modal" :class="activeCls">
			<div class="modal__wrapper">
				<div class="modal__top">
					<h2 class="modal__title">{{ $t('text.amend_phone') }}</h2>
				</div>
				<div class="modal__content">
					<span v-for="error in errors.errors" class="auth-form__error" v-html="error" />
					<app-phone-input
						class="modal__input input"
						:phone-mask="phoneMask"
						v-model:text="phone"
						></app-phone-input>

					<input type="text" class="modal__input input" :placeholder="$t('text.confirm_code_email_placeholder')" v-model="code" />
					<div class="modal__inner modal__inner--end">
						<button class="btn" @click="send">Изменить</button>
					</div>
					<button class="modal__close" @click="onClose" title="Закрыть">Закрыть</button>
				</div>
			</div>
		</div>
		<div class="modal-overlay" :class="overlayCls" @click.self="onClose"></div>
	</div>
</template>

<script lang="ts">
import { ref, watch } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { useStore } from 'vuex';
import getValidator from '../../../../validation/getValidator';
import { MainState } from '../../../../store/mainStore';
import AppPhoneInput from '../../AppPhoneInput.vue';

export default {
	components: { AppPhoneInput },
	props: {
		show: {
			type: Boolean,
			default: false,
			required: true,
		},

		phoneValidation: {
			type: Object,
			default: () => ({}),
			required: true,
		},
	},

	emits: ['close', 'sendCodeEndPhone'],

	setup(props, { emit }) {
		const store = useStore<MainState>();
		const phone = ref('');
		const activeCls = ref('');
		const overlayCls = ref('');
		const code = ref('');
		const errors = ref([]);

		const toggleDialog = (show?: boolean) => {
			if (show) {
				activeCls.value = 'modal--active';
				overlayCls.value = 'modal-overlay--active';
			} else {
				activeCls.value = '';
				overlayCls.value = '';
			}
		};

		const validator = () => {
			const validator: any = getValidator({ phone: phone.value.replace(/\D/g, '') }, props.phoneValidation);
			if (validator?.fails()) {
				errors.value = validator.errors;
				return;
			}
			errors.value = [];
			
			return true;
		};

		watch(
			() => props.show,
			() => toggleDialog(props.show),
		);

		onMounted(() => toggleDialog(props.show));

		return {
			errors,
			send: () => {
				if (validator()) {
					emit('sendCodeEndPhone', { phone: phone.value.replace(/[ +)(-]/g, ''), code: +code.value });
				}
			},
			validator,
			code,
			phone,
			activeCls,
			overlayCls,
			phoneMask: computed(() => store.state.currentValidation?.masks?.phone || ''),
			onClose: () => {
				toggleDialog(false);
				emit('close');
			},
		};
	},
};
</script>
