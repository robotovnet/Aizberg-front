<template>
	<div class="modal">
		<div class="modal__wrapper">
			<div class="modal__top">
				<h2 class="modal__title">{{ header }}</h2>
			</div>
			<div class="modal__content">
				<input :type="inputType" v-model="inputEntry" class="modal__input input" :placeholder="entryPlaceholder" />
				<input type="tel" v-model="inputCode" class="modal__input input" :placeholder="codePlaceholder" />
				<div class="modal__inner modal__inner--end">
					<button v-on:click="onConfirm" class="btn">{{ action }}</button>
				</div>
				<button v-on:click="onClose" class="modal__close" :title="$t('text.remove_dialog_close')">
					{{ $t('text.remove_dialog_close') }}
				</button>
			</div>
		</div>
	</div>
	<div class="modal-overlay"></div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

export default {
	setup() {
		const localization = useI18n();
		const inputEntry = ref('');
		const inputCode = ref('');

		return {
			inputEntry,
			inputCode,
			inputType: 'email',
			header: localization.t('text.new_email'),
			entryPlaceholder: localization.t('text.enter_email_placeholder'),
			codePlaceholder: localization.t('text.confirm_code_email_placeholder'),
			action: localization.t('text.confirm_email_button'),
		};
	},
};
</script>
