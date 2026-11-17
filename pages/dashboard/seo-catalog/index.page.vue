<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit">
		<div class="list list--three list--directory list--short">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.subsections') }}</span>
				<span class="list__heading">{{ $t('text.description') }}</span>
				<span class="list__heading">{{ $t('text.starting_phrases') }}</span>
			</div>
			<div class="list__wrap">
				<template v-for="catalogSection in tree">
					<div
						class="list__item list__item--main"
						:class="{ 'ns-one-click': !catalogSection.children?.length }"
						v-if="catalogSection.parent_section_id === null"
						:key="catalogSection.id">
						<span class="list__elem">
							<span>{{ catalogSection.name }}</span>
						</span>
						<span class="list__elem">
							<a href="#" @click="() => (window.location.href = `/dashboard/seo-catalog/item?edit=${catalogSection.id}`)">{{
								catalogSection.seo_desc ? $t('text.change') : $t('text.add')
							}}</a>
						</span>
						<span class="list__elem">
							<a href="#" @click="() => (window.location.href = `/dashboard/seo-catalog/item?edit=${catalogSection.id}`)">{{
								catalogSection.seo_starting_phrases?.length ? $t('text.change') : $t('text.add')
							}}</a>
						</span>
					</div>
					<template v-if="catalogSection.children?.length">
						<template v-for="(child, index) in catalogSection.children" :key="child.id">
							<div class="list__item" :class="{ 'list__item--last': index === catalogSection.children.length - 1 }">
								<span class="list__elem">
									<span>{{ child.name }}</span>
								</span>
								<span class="list__elem">
									<a href="#" @click="() => (window.location.href = `/dashboard/seo-catalog/item?edit=${child.id}`)">{{
										child.seo_desc ? $t('text.change') : $t('text.add')
									}}</a>
								</span>
								<span class="list__elem">
									<a href="#" @click="() => (window.location.href = `/dashboard/seo-catalog/item?edit=${child.id}`)">{{
										child.seo_starting_phrases?.length ? $t('text.change') : $t('text.add')
									}}</a>
								</span>
							</div>
							<template v-if="child.children?.length">
								<template v-for="(subChild, idx) in child.children" :key="subChild.id">
									<div
										class="list__item list__item--sub"
										:class="{ 'list__item--last': idx === child.children.length - 1 }">
										<span class="list__elem">
											<span>{{ subChild.name }} </span>
										</span>
										<span class="list__elem">
											<a
												href="#"
												@click="() => (window.location.href = `/dashboard/seo-catalog/item?edit=${subChild.id}`)"
												>{{ subChild.seo_desc ? $t('text.change') : $t('text.add') }}</a
											>
										</span>
										<span class="list__elem">
											<a
												href="#"
												@click="() => (window.location.href = `/dashboard/seo-catalog/item?edit=${subChild.id}`)"
												>{{ subChild.seo_starting_phrases?.length ? $t('text.change') : $t('text.add') }}</a
											>
										</span>
									</div>
								</template>
							</template>
						</template>
					</template>
				</template>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import '../../../extensions/Array';

import toaster from '../../../utils/toaster';
import countriesService from '../../../services/countriesService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import useMakeTree from '../../../composables/pages/dashboard/catalogSections/useMakeTree';
import catalogSectionsService from '../../../services/catalogSectionsService';
import productTypesService from '../../../services/productTypesService';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const countries = ref();
const errorNames = ['price_type_id', 'names.0.value', 'is_default'];
const { canEdit, canView } = usePageInit('country');

const { tree, makeTree } = useMakeTree();
const catalogSections = ref();
const productTypes = ref();
const treeInit = async () => {
	catalogSections.value = await catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', true);
	productTypes.value = await productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
	makeTree(catalogSections.value, productTypes.value);
};
watch(
	async () => store.state.ready,
	async () => {
		if (!canView.value) window.location.replace('/dashboard');
	},
);
onMounted(async () => {
  document.title += ` - ${localization.t('text.title')}`;
  await treeInit();
});
</script>
