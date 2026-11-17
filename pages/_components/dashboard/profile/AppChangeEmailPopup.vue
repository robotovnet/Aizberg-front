<template>
	<div>
		<div class="modal" :class="activeCls">
			<div class="modal__wrapper">
				<div class="modal__top">
					<h2 class="modal__title">{{ $t('text.amend_email') }}</h2>
				</div>
				<div class="modal__content">
					<span v-for="error in errors.errors" class="auth-form__error" v-html="error" />
					<input type="text" class="modal__input input" v-model="email" placeholder="Введите новый e-mail" @blur="validator" />

					<input type="text" class="modal__input input" :placeholder="$t('text.confirm_code_phone_placeholder')" v-model="code" />
					<div class="modal__inner modal__inner--end">
						<button class="btn" @click="send">Изменить e-mail</button>
					</div>
					<button class="modal__close" @click="onClose" title="Закрыть">Закрыть</button>
				</div>
			</div>
		</div>
		<div class="modal-overlay" :class="overlayCls" @click.self="onClose"></div>
	</div>
</template>

<script lang="ts">
import { useStore } from 'vuex';
import { ref, watch } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../../store/mainStore';
import getValidator from '../../../../validation/getValidator';

export default {
	props: {
		show: {
			type: Boolean,
			default: false,
			required: true,
		},

		emailValidation: {
			type: Object,
			default: () => ({}),
			required: true,
		},
	},

	emits: ['close', 'sendCodeEndEmail'],

	setup(props, { emit }) {
		const email = ref('');
		const activeCls = ref('');
		const overlayCls = ref('');
		const code = ref('');
		const errors = ref([]);
		const store = useStore<MainState>();
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
			const validator: any = getValidator({ email: email.value }, props.emailValidation);
			if (validator.fails()) {
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
				emit('sendCodeEndEmail', { email: email.value, code: +code.value });
			},
			validator,

			code,
			email,
			activeCls,
			overlayCls,
			onClose: () => {
				toggleDialog(false);
				emit('close');
			},
		};
	},
};
</script>
