<template>
	<span v-if="errors[0]" class="main__error main__error-message" v-html="errors[0]" />
	<span class="main__text">{{ title }}</span>
	<input
		:type="type"
		:value="modelValue"
		@input="vmodel($event)"
		:class="{ 'input--error': !!errors.length }"
		class="main__input input"
		:disabled="disabled"
		:placeholder="placeholder" />
</template>

<script>
export default {
	props: {
		errors: {
			type: Array,
			default() {
				return [];
			},
		},

		type: {
			type: String,
			default: 'text',
		},

		placeholder: {
			type: String,
			default: '',
		},

		title: {
			type: String,
			default: null,
		},

		modelValue: {
			type: [String, Number],
			default: '',
		},

		disabled: {
			type: Boolean,
			default: false,
		},
	},

	emits: ['update:modelValue', 'validate'],

	setup(props, { emit }) {
		const vmodel = e => {
			emit('update:modelValue', e.target.value);
			emit('validate');
		};
		return {
			vmodel,
		};
	},
};
</script>
