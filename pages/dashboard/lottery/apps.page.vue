<template>
	<AppPage :title="$t('text.header')" :canView="canView">
		<div class="main__content">
			<h2 class="main__title">{{ $t('text.active_participants') }}: {{ activeParticipantsCount }}</h2>
			<h2 class="main__title">{{ $t('text.name') }} ({{ $t('text.total') }}: {{ appsList.length }})</h2>
			<div class="sort-controls">
				<label for="sort-select">{{ $t('text.sort_by') }}:</label>
				<select id="sort-select" v-model="currentSort" @change="handleSortChange">
					<option value="created_at">{{ $t('text.sort_by_date') }}</option>
					<option value="player_phone">{{ $t('text.sort_by_phone') }}</option>
				</select>
			</div>
		</div>

		<div v-if="appsList.length > 0" class="list list--six">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.ticket') }}</span>
				<span class="list__heading">{{ $t('text.client') }}</span>
				<span class="list__heading">{{ $t('text.phone') }}</span>
				<span class="list__heading">{{ $t('text.email') }}</span>
				<span class="list__heading">{{ $t('text.date') }}</span>
				<span class="list__heading">{{ $t('text.details') }}</span>
			</div>
			<div>
				<div v-for="item in appsList" :key="item.id" class="list__item list__item--main">
					<span class="list__elem">{{ item.ticket.code }}</span>
					<span class="list__elem">{{ item.player_name }}</span>
					<span class="list__elem">{{ item.player_phone }}</span>
					<span class="list__elem">{{ item.player_email }}</span>
					<span class="list__elem">{{ item.created_at }}</span>
					<span class="list__elem"
						><a :href="`/dashboard/lottery/app/?id=${item.id}`">{{ $t('text.more_details') }}</a></span
					>
				</div>
			</div>
		</div>
		<div v-else class="no-apps">
			{{ $t('text.no_active_applications') }}
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
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
import lotteryService from '../../../services/lotteryService';

const { canEdit, canView } = usePageInit('lottery');

const appsList = ref([]);
const activeParticipantsCount = ref(0);
const currentSort = ref('created_at');

onBeforeMount(async () => {
	pageInit(currentSort.value);
});

const pageInit = async (orderBy = null) => {
	if (!canView.value) redirect('/dashboard');
	const [response, participantsCountData]: any[] = await Promise.all([
		lotteryService.getApplicationsList(localization, orderBy),
		lotteryService.getActiveParticipantsCount(localization),
	]);
	appsList.value = response;
	activeParticipantsCount.value = participantsCountData?.active_participants ?? 0;
};

const handleSortChange = async () => {
	await pageInit(currentSort.value);
};

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>

<style>
.list--six .list__heading:nth-child(5),
.list--six .list__elem:nth-child(5) {
	max-width: 180px;
}
.no-apps {
	text-align: center;
	padding: 20px;
	font-size: 16px;
	color: #666;
}
.sort-controls {
	margin: 20px 0;
	display: flex;
	align-items: center;
	gap: 10px;
}
.sort-controls label {
	font-weight: 500;
	color: #333;
}
.sort-controls select {
	padding: 8px 12px;
	border: 1px solid #ddd;
	border-radius: 4px;
	background-color: white;
	font-size: 14px;
	min-width: 200px;
}
.sort-controls select:focus {
	outline: none;
	border-color: #007bff;
	box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
</style>
