<template>
	<AppPage :title="$t('text.title')" :canEdit="canEdit">
		<div class="list list--five list--photo">
			<div class="list__topping">
				<div class="list__heading" style="max-width: 60px;">{{ $t('text.order') }}</div>
				<span class="list__heading">{{ $t('text.tiled') }}</span>
				<span class="list__heading">{{ $t('text.subsections') }}</span>
				<span class="list__heading">{{ $t('text.level_nesting') }}</span>
				<span class="list__heading">{{ $t('text.products_amount') }}</span>
				<span class="list__heading">{{ $t('text.show') }}</span>
			</div>
			<template v-for="(catalogSection, index) in catalogSections">
				<div>
					<div class="list__item">
						<div class="list__elem" style='max-width: 60px;'>
							<select 
								@change="updateOrderSections(catalogSection, $event, null)"
								class="main__select select">
								<option v-for="(, indx) in catalogSections" 
									:selected="(indx+1)==catalogSection.tiled_order"
									:value="(indx + 1)">{{ (indx + 1) }}</option>
							</select>
							<div style='text-align: center; margin-top: 8px;'>
								<span @click="updateOrderSections(catalogSection, $event, index)" style='cursor: pointer; padding: 5px; display: inline-block;'><img src='../../../assets/img/arrow_order.svg' :alt="$t('text.parameter_up')" :title="$t('text.parameter_up')" style='transform:rotate(180deg);' /></span>
								<span @click="updateOrderSections(catalogSection, $event, index+2)" style='cursor: pointer; padding: 5px; display: inline-block;'><img src='../../../assets/img/arrow_order.svg' :alt="$t('text.parameter_down')" :title="$t('text.parameter_down')" style='margin-left: 6px;' /></span>
							</div>
						</div>
						<div class="list__elem">
							<img v-if="catalogSection?.thumbnail" :src="imgPath + catalogSection?.thumbnail" alt="Photo" />
							<span v-else class="list__elem--message">Плитка не загружена</span>
						</div>
						<span class="list__elem">{{ catalogSection.name }}</span>
						<span class="list__elem">{{ catalogSection.level_nesting }}</span>
						<span class="list__elem">{{ catalogSection.products_count }}</span>
						<span class="list__elem">
							<button
								class="dot"
								:class="{
									'dot--red': catalogSection?.should_display_on_main_page === 'N',
									'dot--green': catalogSection?.should_display_on_main_page === 'Y',
								}"
								@click="displayOnMainPage(catalogSection)"></button>
						</span>
					</div>
				</div>
			</template>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';

import '../../../extensions/Array';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import catalogSectionsService from '../../../services/catalogSectionsService';
import { IMG_SECTION_PATH } from '../../../utils/constants';
import tiledService from '../../../services/tiledService';
import onSort from '../../../utils/onSort';
import sleep from '../../../utils/sleep';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const imgPath = IMG_SECTION_PATH;

const { canEdit, canView } = usePageInit('catalog.sections');

const updateOrderSections = async (section_item, event, pos) => {
	if (canEdit.value) {
		const totalItems = catalogSections.value.length;
		const tempArr = catalogSections.value.filter(section => section.id !== section_item.id);
		
		if (pos == null) {
			tempArr.splice(event.target.value - 1, 0, section_item);
		} else {
			if (pos == 0) {
				pos = totalItems;
			}
	
			if (pos > totalItems) {
				pos = 1;
			}
	
			tempArr.splice(pos - 1, 0, section_item);
		}
	
		tempArr.forEach((item, index) => (item.tiled_order = (index + 1).toString()));
	
		if (pos != null) {
			catalogSections.value = tempArr;
		}
	
		const sendData = { orders: [] };
		sendData.orders = tempArr.map(section => ({
			section_id: section.id,
			order: section.tiled_order,
		}));
		await sleep(1);
		store.commit('setLoading', true);
		await tiledService.setOrder(localization, sendData, errMsg => toaster.error(toast, errMsg));
		await fetchCatalogSections();
		store.commit('setLoading', false);
	}
};

const fetchCatalogSections = async () => {
	await sleep(1);
	store.commit('setLoading', true);
	catalogSections.value = await catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	catalogSections.value.sortAscendantByField('tiled_order');
	store.commit('setLoading', false);
};
const catalogSections = ref();
onBeforeMount(async () => {
	await fetchCatalogSections();
});

const displayOnMainPage = async catalogSection => {
	store.commit('setLoading', true);
	await tiledService.shouldDisplay(
		localization,
		catalogSection.id,
		{ should_display: catalogSection.should_display_on_main_page === 'Y' ? 'N' : 'Y' },
		errMsg => toaster.error(toast, errMsg),
	);
	await fetchCatalogSections();
	store.commit('setLoading', false);
};
onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
