<template>
	<AppPage
		:button-text="$t('text.add_button')"
		:title="$t('text.header')"
		:handler="() => redirect('/dashboard/materials/item')"
		:canEdit="canEdit">
		<div class="list list--six list--prop list--fv list--background">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.section') }}</span>
				<span class="list__heading" style='max-width: 360px'>{{ $t('text.table_title') }}</span>
				<span class="list__heading" style='max-width: 60px'>{{ $t('text.type') }}</span>
				<span class="list__heading" style='max-width: 160px'>{{ $t('text.code') }}</span>
				<span class="list__heading" style='max-width: 40px'>{{ $t('text.active') }}</span>
				<span class="list__heading" style='max-width: 40px'>{{ $t('text.remove') }}</span>
			</div>
			<div :key="idx" v-for="(shop, idx) in shops">
				<div class="main__content">
					<h2 class="main__title">({{ shop.city?.name }}) {{ shop.subdomain ? `${shop.subdomain}.` : '' }}{{ currentDomain }}</h2>
				</div>
				<template v-for="material in materials">
					<div :key="material.id" class="list__item" v-if="shop.id === material.shop_id">
						<span class="list__elem">{{ material.section_name }}</span>
						<span class="list__elem">
							<a v-if="material.type === 'page'" :href="removeSubdomain(material.url)" target="_blank" class="list__elem--link" title='Открыть на сайте'></a>
							<a href="#" v-if="canEdit" @click="() => redirect(`/dashboard/materials/item?edit=${material.id}`)" style='display: inline; margin-left:6px;'>{{ material.name }}</a>
							<p v-else>{{ material.name }}</p>
						</span>
						<span class="list__elem">{{ material.type }}</span>
						<span class="list__elem">{{ material.code }}</span>
						<span class="list__elem">
							<button
								:disabled="!canEdit"
								class="dot dot--green"
								@click="activateMaterial(material.id)"
								:class="{ 'dot--red': material.is_active === 'N', 'dot--green': material.is_active === 'Y' }"
								:title="material.is_active === 'N' ? $t('text.active') : $t('text.not_active')"></button>
						</span>
						<span class="list__elem">
							<button
								:disabled="!canEdit"
								class="cross"
								@click="onConfirmDelete(material?.id, material?.name)"
								:title="$t('text.remove')"></button>
						</span>
					</div>
				</template>
			</div>
		</div>

		<AskDialog
			:deleteId="itemId?.toString()"
			:title="$t('text.dialog_delete_title')"
			:question="$t('text.dialog_delete_question') + '&quot;' + itemName + '&quot;' + '?'"
			:onConfirm="onDelete" />
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount, computed } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';

import '../../../extensions/Array';
import AskDialog from '../../_components/AskDialog.vue';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import materialsService from '../../../services/materialsService';
import shopsService from '../../../services/shopsService';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
import { removeSubdomain } from '../../../utils/constants';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const materials = ref();
const shops = ref();

const { canEdit, canView } = usePageInit('material');

const currentDomain = computed(() => {
	if (typeof window !== 'undefined') {
		const hostname = window.location.hostname;
		// Извлекаем базовый домен (последние 2 части)
		const parts = hostname.split('.');
		if (parts.length >= 2) {
			return parts.slice(-2).join('.');
		}
		return hostname;
	}
	return '';
});

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(materialsService);
watch(
	() => marker.value,
	() => (materials.value = materials.value.filter(c => c.id !== itemId.value)),
);
const material = ref();

const activateMaterial = async id => {
	await sleep(1);
	store.commit('setLoading', true);
	material.value = await materialsService.get(localization, id, errMsg => toaster.error(toast, errMsg));
	const sendData = {
		shop_id: material.value.shop_id,
		name: material.value.name,
		url_slug: material.value.url_slug,
		code: material.value.code,
		section_name: material.value.section_name,
		type: material.value.type,
		meta_keywords: material.value.meta_keywords,
		meta_description: material.value.meta_description,
		content: material.value.content,
		is_active: material.value.is_active === 'Y' ? (material.value.is_active = 'N') : (material.value.is_active = 'Y'),
	};
	await materialsService.update(localization, id, sendData, [], errMsg => toaster.error(toast, errMsg));
	materials.value = await materialsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
};

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		materialsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		shopsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	])
		.then(values => ([materials.value, shops.value] = [...values]))
		.then(() => store.commit('setLoading', false));
});

watch(
	() => store.state.materialsSearch,
	() => {
		materials.value = store.state.materialsSearch;
	}
);

watch(
	() => store.state.searchQuery,
	async () => {
		if (store.state.searchQuery.length < 2) {
			store.commit('setLoading', true);
			materials.value = await materialsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
			store.commit('setLoading', false);
		}
	}
);

	
onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
<style lang="scss" scoped>
.list__elem--link:after {
	margin-left: 0px;
}

.list--six.list--prop .list__heading:nth-child(3n), .list--six.list--prop .list__elem:nth-child(2n) {
    max-width: 360px;
}

.list--six.list--prop .list__heading:nth-child(3n), .list--six.list--prop .list__elem:nth-child(3n) {
    max-width: 60px;
}

.list--six.list--prop .list__heading:nth-child(3n), .list--six.list--prop .list__elem:nth-child(4n) {
    max-width: 160px;
}

.list--six.list--prop .list__heading:nth-child(3n), .list--six.list--prop .list__elem:nth-child(5n) {
    max-width: 40px;
}

.list--six.list--prop .list__heading:nth-child(3n), .list--six.list--prop .list__elem:nth-child(6n) {
    max-width: 40px;
}

.list--six .list__elem:first-child, .list--six .list__heading:first-child {
    max-width: 150px;
}

.dot {
    margin-left: 12px;
}
</style>
