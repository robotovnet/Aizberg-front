<template>
	<div v-show="show" class="dim">
		<div class="loader-four">
			<div class="loader-four__preloader"></div>
		</div>
	</div>
</template>

<script lang="ts">
export default {
	props: {
		show: {
			type: Boolean,
			required: true,
		},
	},
};
</script>
