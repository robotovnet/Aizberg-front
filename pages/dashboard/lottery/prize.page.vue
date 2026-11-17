<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit">
		<div class="main__content">
			<h2 class="main__title">{{ $t('text.add_to_lottery') }}</h2>
		</div>

		<div class="main__content main__content--column">
			<div class="main__wrapper">
				<div class="main__inner main__inner--short">
					<span class="main__text">{{ $t('text.enter_vendor_code') }}</span>
					<input
						v-model="productVendorCode"
						type="text"
						:placeholder="$t('text.enter_vendor_code_placeholder')"
						class="main__input input" />
					<button @click="handleCreatePrize" class="btn" :disabled="!productVendorCode">
						{{ $t('text.add_to_lottery_button') }}
					</button>
				</div>
			</div>
		</div>

		<div class="main__content">
			<h2 class="main__title">{{ $t('text.name') }}</h2>
		</div>

		<div class="list list--four">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.prize') }}</span>
				<span class="list__heading">{{ $t('text.type') }}</span>
				<span class="list__heading">{{ $t('text.status') }}</span>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			<div>
				<div v-for="item in prizesList" :key="item.id" class="list__item list__item--main">
					<span class="list__elem">{{ item.product.name }}</span>
					<span class="list__elem">{{ item.product.group.plural_name }}</span>
					<span class="list__elem">{{ item.status }}</span>
					<span class="list__elem">
                    <button
						class="cross"
						:disabled="!canEdit"
						:title="$t('text.remove')"
						@click="handleRemovePrize(item.id, item.product.name)"></button>
                    </span>
				</div>
			</div>
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

const productVendorCode = ref('');
const prizesList = ref([]);

const handleCreatePrize = async () => {
	const errorNames = ['product_vendor_code'];

	store.commit('setLoading', true);

	const response: any = await lotteryService.createPrize(
		localization,
		{ product_vendor_code: productVendorCode.value },
		errorNames,
		errMsg => {
			store.commit('setLoading', false);
			toast.error(errMsg);
		},
	);

	if (response.message === 'success') {
		toast.success(localization.t('text.prize_added'));
		productVendorCode.value = '';

        await fetchPrizesList();
	}

	store.commit('setLoading', false);
};

const fetchPrizesList = async () => {
	const response: any = await lotteryService.getPrizeList(localization);
    prizesList.value = response;
};

const handleRemovePrize = async (prizeId: number, prizeName: string) => {
    if (!confirm(localization.t('text.confirm_remove_prize') + ` "${prizeName}"`)) return;

    store.commit('setLoading', true);

    const response: any = await lotteryService.deletePrize(
        localization,
        prizeId,
        (errMsg) => {
            store.commit('setLoading', false);
            toast.error(errMsg);
        }
    );

    if (response.message === 'success') {
        toast.success(localization.t('text.prize_removed'));
        await fetchPrizesList();
    }

    store.commit('setLoading', false);
};

onBeforeMount(async () => {
	pageInit();
});

const pageInit = async () => {
	if (!canEdit.value) redirect('/dashboard');

    store.commit('setLoading', true);
	await fetchPrizesList();
	store.commit('setLoading', false);
};

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>

<style>
.list--four .list__heading:nth-child(1), .list--four .list__elem:nth-child(1) {
    max-width: 380px;
}
</style>