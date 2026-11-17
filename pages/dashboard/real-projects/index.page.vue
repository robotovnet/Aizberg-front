<template>
	<AppPage
		v-if="canView"
		:button-text="$t('text.add_button')"
		:title="$t('text.header')"
		:handler="() => redirect('/dashboard/real-projects/item')"
		:canEdit="canEdit">
		<div class="list list--five">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.table_name') }}</span>
				<span class="list__heading">{{ $t('text.table_banner') }}</span>
				<span class="list__heading">{{ $t('text.table_url') }}</span>
				<span class="list__heading">{{ $t('text.table_sort') }}</span>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			<div :key="project.id" class="list__item" v-for="project in projects">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						@click="() => redirect(`/dashboard/real-projects/item?edit=${project.id}`)"
						class="list__edit"
						:title="$t('text.edit')"></button>
					<span>{{ project.name }}</span>
				</span>
				<span class="list__elem">
					<span class="real-project__banner">
						<img :src="bannerSrc(project.banner_url)" :alt="project.name" />
					</span>
				</span>
				<span class="list__elem">
					<a :href="project.url" target="_blank" rel="noopener noreferrer" class="real-project__link">{{ project.url }}</a>
				</span>
				<span class="list__elem">{{ project.sort }}</span>
				<span class="list__elem">
					<button
						class="cross"
						:disabled="!canEdit"
						:title="$t('text.remove')"
						@click="onConfirmDelete(project.id, project.name)"></button>
				</span>
			</div>
			<div v-if="isLoaded && !projects?.length" class="list__item">
				<span class="list__elem">{{ $t('text.empty') }}</span>
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
import { inject, ref, watch, onBeforeMount } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import realProjectsService from '../../../services/realProjectsService';
import redirect from '../../../utils/redirect';
import AskDialog from '../../_components/AskDialog.vue';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import toaster from '../../../utils/toaster';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import sleep from '../../../utils/sleep';
import { getApiUrl } from '../../../utils/constants';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const projects = ref<any[]>([]);
const isLoaded = ref<boolean>(false);
const { canEdit, canView } = usePageInit('realprojects');

// banner_url может прийти как абсолютный URL или относительно хоста API (/storage/real-projects/...)
const bannerSrc = (bannerUrl: string) =>
	/^(https?:)?\/\//i.test(bannerUrl) ? bannerUrl : getApiUrl().replace(/\/+$/, '') + bannerUrl;

onBeforeMount(async () => {
	await sleep(1);
	store.commit('setLoading', true);
	const response = await realProjectsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	projects.value = Array.isArray(response) ? response : [];
	isLoaded.value = true;
	store.commit('setLoading', false);
});

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(realProjectsService);

watch(
	() => marker.value,
	() => (projects.value = projects.value.filter((item: any) => item.id !== itemId.value)),
);
</script>

<style scoped>
/* list--five рассчитан на узкую вторую колонку; баннеру и ссылке нужно больше места */
.list--five .list__heading:nth-child(2), .list--five .list__elem:nth-child(2) {
	max-width: 140px;
}

.list--five .list__heading:nth-child(3), .list--five .list__elem:nth-child(3) {
	margin-left: 60px;
	max-width: none;
}

.real-project__banner {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	width: 120px;
	height: 40px;
	padding: 4px 8px;
	border-radius: 4px;
	/* Логотипы на сайте выводятся на тёмном фоне, поэтому светлые SVG должны быть видны и здесь */
	background: #1b1b1b;
}

.real-project__banner img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.real-project__link {
	color: #428AB4;
	text-decoration: underline;
	word-break: break-all;
}
</style>
