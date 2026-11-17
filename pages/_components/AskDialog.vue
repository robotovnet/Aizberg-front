<template>
	<div class="modal"
	     :class="activeCls">
		<div class="modal__wrapper">
			<div class="modal__top">
				<h2 class="modal__title">{{ title }}</h2>
			</div>
			<div class="modal__content">
				<p>{{ question }}</p>
				<div class="modal__inner modal__inner--end">
					<button v-on:click="onClose(); onConfirm(deleteId)"
					        class="btn"
					        style="width: 60px">{{ $t('text.remove_dialog_yes') }}
					</button>
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					<button v-on:click="onClose"
					        class="btn"
					        style="width: 60px">{{ $t('text.remove_dialog_no') }}
					</button>
				</div>
				<button v-on:click="onClose"
				        class="modal__close"
				        :title="$t('text.remove_dialog_close')">{{ $t('text.remove_dialog_close') }}
				</button>
			</div>
		</div>
	</div>
	<div class="modal-overlay"
	     :class="overlayCls"></div>
</template>

<script lang="ts">

import { onMounted } from '@vue/runtime-core';
import { ref, watch } from 'vue';

export default {
	props: {
		deleteId: {
			type: String,
			required: false,
		},
		title: {
			type: String,
			required: true,
		},
		question: {
			type: String,
			required: true,
		},
		onConfirm: {
			type: Function,
			required: true,
		},
	},
	setup(props) {
		const activeCls = ref('');
		const overlayCls = ref('');

		const toggleDialog = (show?: string) => {
			if (show) {
				activeCls.value = 'modal--active';
				overlayCls.value = 'modal-overlay--active';
			} else {
				activeCls.value = '';
				overlayCls.value = '';
			}
		};
		watch(() => props.deleteId, () => toggleDialog(props.deleteId));

		onMounted(() => toggleDialog(props.deleteId));

		return {
			activeCls,
			overlayCls,
			onClose: () => toggleDialog(undefined),
		};
	},
};
</script>
