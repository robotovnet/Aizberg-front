<template>
	<AppPage :title="$t('text.header')" :canView="canView">
		<div class="main__content">
			<h2 class="main__title" style="display: inline-block">{{ $t('text.name') }}{{ appId }}</h2>
			<a href="/dashboard/lottery/apps" class="btn" style="float: right; text-decoration: none">{{ $t('text.back_to_list') }}</a>
			<div style="clear: both"></div>
		</div>

		<div class="list__topping">
			<span class="list__heading">{{ $t('text.ticket') }}</span>
			<span class="list__heading">{{ $t('text.client') }}</span>
			<span class="list__heading">{{ $t('text.phone') }}</span>
			<span class="list__heading">{{ $t('text.email') }}</span>
			<span class="list__heading">{{ $t('text.status') }}</span>
			<span class="list__heading">{{ $t('text.date') }}</span>
		</div>
		<div>
			<div class="list__item list__item--main">
				<span class="list__elem">{{ app?.ticket?.code }}</span>
				<span class="list__elem">{{ app?.player_name }}</span>
				<span class="list__elem">{{ app?.player_phone }}</span>
				<span class="list__elem">{{ app?.player_email }}</span>
				<span class="list__elem" :class="{ 'status--red': app?.status === $t('text.repeat_review') }">{{ app?.status }}</span>
				<span class="list__elem">{{ app?.created_at }}</span>
			</div>
		</div>

		<div class="app__actions">
			<button class="btn" @click="acceptApplication">{{ $t('text.accept') }}</button>
			<button class="btn btn--red" style="margin-left: 16px" @click="showRejectModal = true">{{ $t('text.reject') }}</button>
		</div>

		<!-- Модальное окно для отклонения заявки -->
		<div v-if="showRejectModal" class="modal_wnd">
			<div class="modal_wnd__content">
				<h3>{{ $t('text.reject_reason') }}</h3>
				<textarea 
					v-model="rejectReason" 
					class="modal_wnd__textarea"
					:placeholder="$t('text.enter_reject_reason')"
				></textarea>
				<div class="modal_wnd__buttons">
					<button class="btn" @click="showRejectModal = false">{{ $t('text.close') }}</button>
					<button class="btn btn--red" @click="handleReject">{{ $t('text.reject_application') }}</button>
				</div>
			</div>
		</div>

		<div class="app__screenshot">
			<div class="app__screenshot-heading">{{ $t('text.screenshot') }}</div>
			<a :href="screenshotUrl" target="_blank">
				<img :src="screenshotUrl" :title="$t('text.open_original')" alt="screenshot" />
			</a>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
import lotteryService from '../../../services/lotteryService';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const { canEdit, canView } = usePageInit('lottery');
const app = ref({});
const appId = ref(0);
const screenshotUrl = ref('data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D');
const showRejectModal = ref(false);
const rejectReason = ref('');

onBeforeMount(async () => {
	pageInit();
});

const pageInit = async () => {
	if (!canView.value) redirect('/dashboard');

	const urlParams = new URLSearchParams(window.location.search);
	appId.value = urlParams.get('id');

	if (!appId.value) {
		redirect('/dashboard/lottery/apps');
	}

	const response: any = await lotteryService.getApplicationDetails(localization, appId.value);
	app.value = response;
	screenshotUrl.value = import.meta.env.VITE_API_URL + app.value?.screenshot_url;
};

const acceptApplication = async () => {
	const response: any = await lotteryService.acceptApplication(localization, appId.value, errMsg => {
		store.commit('setLoading', false);
		toast.error(errMsg);
	});

	if (response.message === 'success') {
		toast.success(localization.t('text.application_accepted'));
		redirect('/dashboard/lottery/apps');
	}
};

const handleReject = async () => {
	const response: any = await lotteryService.rejectApplication(
		localization, 
		appId.value, 
		rejectReason.value, 
		errMsg => {
			store.commit('setLoading', false);
			toast.error(errMsg);
		}
	);

	if (response.message === 'success') {
		toast.success(localization.t('text.application_rejected'));
		showRejectModal.value = false;
		rejectReason.value = '';
		redirect('/dashboard/lottery/apps');
	}
};

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>

<style>
.app__actions {
	margin-top: 10px;
	margin-right: 30px;
	text-align: right;
    border-top: 1px solid #ededed;
    padding-top: 30px;
}

.app__screenshot {
	margin-left: 20px;
	margin-top: 30px;
	text-align: center;
	border-top: 1px solid #ededed;
}

.app__screenshot-heading {
	font-size: 18px;
	font-weight: 400;
	margin-bottom: 10px;
	margin-top: 14px;
}

.app__screenshot img {
	max-width: 500px;
	width: 100%;
	height: auto;
	border-radius: 10px;
	margin-bottom: 40px;
}

.status--red {
	color: red;
}

.modal_wnd {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal_wnd__content {
	background: white;
	padding: 20px;
	border-radius: 8px;
	width: 90%;
	max-width: 500px;
}

.modal_wnd__textarea {
	width: 100%;
	min-height: 100px;
	margin: 15px 0;
	padding: 10px;
	border: 1px solid #ddd;
	border-radius: 4px;
	resize: vertical;
}

.modal_wnd__buttons {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
}
</style>
