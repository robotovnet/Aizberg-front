<template>
    <AppPage :title="$t('text.header')" :canEdit="canEdit" v-if="canView">
	<form action="" class="main__content main__content--bdb">
		<div class="main__inner">
			<!-- С - ПО -->
			<div class="main__group">
				<span class="main__text main__text--nowrap">{{ $t('text.from_date') }}</span>
				<input type="date" v-model="startDay" class="main__input input" />
				<span class="main__text main__text--black main__text--nowrap">{{ $t('text.to_date') }}</span>
				<input type="date" v-model="endDay" class="main__input input" />
			</div>

			<button class="btn" @click.prevent="filter">{{ $t('text.getExcel') }}</button>
		</div>
	</form>
    </AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { ref, onBeforeMount } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../../store/mainStore';
import usePageInit from '../../../../composables/pages/dashboard/usePageInit';
import redirect from '../../../../utils/redirect';

const localization: any = useI18n();
const store = useStore<MainState>();
const { canEdit, canView } = usePageInit('order');

const lastMonth = new Date(Date.now() - (86400000 * 30));
const today = new Date();

const startDay = ref(lastMonth.getFullYear() + '-' + ('0' + (lastMonth.getMonth()+1)).slice(-2) + '-' + ('0' + lastMonth.getDate()).slice(-2));
const endDay = ref(today.getFullYear() + '-' + ('0' + (today.getMonth()+1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2));
const apiServer = import.meta.env.VITE_API_URL;
	
const filter = async () => {
	location.href = apiServer + "/orders/reports/productsInOrders/" + startDay.value + "/" + endDay.value;
};

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');	
});

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
