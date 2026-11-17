<template>
	<!-- <Transition> -->
	<div class="main">
		<div class="main__top">
			<h1>{{ title }}</h1>
			<button v-if="!!buttonText && canEdit" @click="handler" class="main__btn main__btn--add">{{ buttonText }}</button>
		</div>
		<slot></slot>
	</div>
	<!-- </Transition> -->
</template>

<script lang="ts">
export default {
	props: {
		canEdit: {
			type: Boolean,
			default: false,
		},

		handler: {
			type: Function,
			default: null,
		},

		buttonText: {
			type: String,
			default: '',
		},

		title: {
			type: String,
			default: '',
			required: true,
		},
	},
};
</script>
