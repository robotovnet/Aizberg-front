<template>
	<main class="main">
		<div></div>
	</main>
</template>
<script setup lang="ts">
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { computed, onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../store/mainStore';
import redirect from '../utils/redirect';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
if (store.state.userProfile.redirect_to) {
	redirect(store.state.userProfile.redirect_to);
}
</script>
