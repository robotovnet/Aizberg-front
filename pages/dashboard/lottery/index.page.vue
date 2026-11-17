<template>
	<AppPage :title="$t('text.header')" :canView="canView">
		<div v-if="drawsList.length > 0" class="list list--six">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.period') }}</span>
				<span class="list__heading">{{ $t('text.ticket') }}</span>
				<span class="list__heading">{{ $t('text.prize') }}</span>
				<span class="list__heading">{{ $t('text.client_name') }}</span>
				<span class="list__heading">{{ $t('text.email') }}</span>
				<span class="list__heading">{{ $t('text.phone') }}</span>
			</div>
			<div>
				<div v-for="item in drawsList" :key="item.id" class="list__item list__item--main">
					<span class="list__elem">{{ item.day }}</span>
					<span class="list__elem">{{ item.ticket.code }}</span>
					<span class="list__elem">{{ item.prize.product.name }}</span>
					<span class="list__elem">{{ item.app?.player_name || '-' }}</span>
					<span class="list__elem">{{ item.app?.player_email || '-' }}</span>
					<span class="list__elem">{{ item.app?.player_phone || '-' }}</span>
				</div>
			</div>
		</div>
		<div v-else class="no-results">
			{{ $t('text.no_results') }}
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

onBeforeMount(async () => {
	pageInit();
});

const drawsList = ref([]);

const pageInit = async () => {
	if (!canView.value) redirect('/dashboard');
	const response: any = await lotteryService.getDrawsList(localization);
	drawsList.value = response;
};

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>

<style>
.no-results {
    text-align: center;
    padding: 20px;
    font-size: 16px;
    color: #666;
}

.list--six .list__heading:nth-child(5), .list--six .list__elem:nth-child(5) {
    max-width: 220px;
    margin-left: unset;
}

.list--six .list__heading:nth-child(1), .list--six .list__elem:nth-child(1) {
    max-width: 100px;
}

</style>
