<template>
	<AppPage :button-text="$t('text.add_button')" :handler="showAddYmlModal" :title="$t('text.header')" :canEdit="canEdit" v-if="canView">
		<div class="list list--four">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.shop') }}</span>
				<span class="list__heading">{{ $t('text.url_yml') }}</span>
				<span class="list__heading">{{ $t('text.offers_num') }}</span>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			<div :key="yml.id" class="list__item" v-for="yml in ymls">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						@click="showEditYmlModal(yml)"
						class="list__edit modal-btn"
						:title="$t('text.edit')"></button>
					<span>{{ yml.shop_name }}</span>
				</span>
				<span class="list__elem"
					><a :href="yml.shop_domain" target="_blank" rel="noopener">{{ yml.shop_domain }}</a></span
				>
				<span class="list__elem">{{ yml.total_offers }}</span>
				<span class="list__elem">
					<button
						class="cross"
						:disabled="!canEdit"
						@click="onConfirmDelete(yml?.id, yml?.shop_domain)"
						:title="$t('text.remove')"></button>
				</span>
			</div>
		</div>
		<div class="main__bottom">
			<div class="main__inner main__inner--end">
				<button @click="showCatalogSectionsModal" :disabled="!isActiveSubsectionButton || !canEdit" class="btn modal-btn">
					{{ $t('text.choose_subsection') }}
				</button>
			</div>
		</div>
		<add-yml-file-modal
			:is-visible="isAddModalVisible"
			:shops="shops"
			:warehouses="warehouses"
			@save="saveYml"
			@close="isAddModalVisible = false"></add-yml-file-modal>
		<edit-yml-file-modal
			:is-visible="isEditModalVisible"
			:yml="editedYml"
			:warehouses="warehouses"
			@update="updateYml"
			v-if="renderComponent"
			@close="closeYml"></edit-yml-file-modal>
		<catalog-sections-modal
			v-if="renderComponent"
			:is-visible="isCatalogSectionsModalVisible"
			:catalogSections="catalogSections"
			:product-types="productTypes"
			@update="updateCatalog"
			@close="isCatalogSectionsModalVisible = false"></catalog-sections-modal>
		<AskDialog
			:deleteId="itemId?.toString()"
			:title="$t('text.dialog_delete_title')"
			:question="$t('text.dialog_delete_question') + '&quot;' + itemName + '&quot;' + '?'"
			:onConfirm="onDelete" />
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import toaster from '../../../utils/toaster';
import { useStore } from 'vuex';
import { inject, ref, watch, getCurrentInstance, nextTick, onBeforeMount } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import '../../../extensions/Array';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import AddYmlFileModal from '../../_components/dashboard/yml/AddYmlFileModal.vue';
import EditYmlFileModal from '../../_components/dashboard/yml/EditYmlFileModal.vue';
import CatalogSectionsModal from '../../_components/dashboard/CatalogSectionsModal.vue';
import shopsService from '../../../services/shopsService';
import warehousesService from '../../../services/warehousesService';
import ymlService from '../../../services/ymlService';
import AskDialog from '../../_components/AskDialog.vue';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import catalogSectionsService from '../../../services/catalogSectionsService';
import productTypesService from '../../../services/productTypesService';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const cities = ref();
const renderComponent = ref(true);
const country = ref('ru');
const isAddModalVisible = ref(false);
const isEditModalVisible = ref(false);
const isCatalogSectionsModalVisible = ref(false);
const citiesData = ref();
const shops = ref<any>([]);
const warehouses = ref<any>([]);
const ymls = ref();
const catalogSections = ref();
const productTypes = ref();
const isActiveSubsectionButton = ref(false);

const { canEdit, canView } = usePageInit('ad.yml');

const filterCities = (cities, countryCode) => cities.filter(city => city.country_code === countryCode);
const filter = () => {
	cities.value = filterCities(citiesData.value, country.value);
};
const ymlInit = async () => {
	ymls.value = await ymlService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	ymls.value.forEach(yml => {
		const shop = shops.value.filter(shop => shop.id === yml.shop_id);
		yml.shop = shop[0];
	});
};

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	let checkedSections;
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		warehousesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		shopsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		ymlService.getSections(localization, errMsg => toaster.error(toast, errMsg)),
		catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		ymlInit(),
	])
		.then(values => ([warehouses.value, shops.value, checkedSections, catalogSections.value, productTypes.value] = [...values]))
		.then(() => {
			catalogSections.value.forEach(section => {
				section.checked = false;
				checkedSections.forEach(checkedSection => {
					if (checkedSection.section_id === section.id) section.checked = true;
				});
			});

			store.commit('setLoading', false);
			isActiveSubsectionButton.value = true;
		});
});

const errorNames = ['shop_name', 'company_name', 'shop_domain', 'shop_id'];

const { create, update } = useCreateOrUpdate(ymlService, errorNames, '');
let isClicked = false;

const saveYml = async data => {
	store.commit('setLoading', true);
	const response: any = await ymlService.create(localization, data, errorNames, errMsg => toaster.error(toast, errMsg));
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessCreated'));
		await ymlInit();
		isAddModalVisible.value = false;
	}
	store.commit('setLoading', false);
};

const updateYml = async yml => {
	console.log('YAML');
	store.commit('setLoading', true);
	const response: any = await ymlService.update(localization, yml.id, yml, errorNames, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		await ymlInit();
	}
};
const closeYml = async () => {
	isEditModalVisible.value = false;
	await ymlInit();
};

const forceRerender = async () => {
	renderComponent.value = false;
	await nextTick();
	renderComponent.value = true;
};
const updateCatalog = async sectionIds => {
	store.commit('setLoading', true);
	const response: any = await ymlService.setSections(localization, { sections: sectionIds }, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		isCatalogSectionsModalVisible.value = false;

		store.commit('setLoading', true);
		const checkedSections: any = await ymlService.getSections(localization, errMsg => toaster.error(toast, errMsg));
		catalogSections.value = await catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
		catalogSections.value.forEach(section => {
			section.checked = false;
			checkedSections.forEach(checkedSection => {
				if (checkedSection.section_id === section.id) section.checked = true;
			});
		});
		productTypes.value = await productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
		store.commit('setLoading', false);
		isActiveSubsectionButton.value = true;

		const instance = getCurrentInstance();
		instance?.proxy?.$forceUpdate();
		await forceRerender();
	}
};

const showAddYmlModal = () => {
	isAddModalVisible.value = true;
};
const editedYml = ref({
	shop_domain: '',
	company_name: '',
	shop_name: '',
});

const showEditYmlModal = yml => {
	editedYml.value = yml;
	isEditModalVisible.value = true;
};

const showCatalogSectionsModal = async () => {
	if (!isCatalogSectionsModalVisible.value) {
		store.commit('setLoading', true);
		const checkedSections: any = await ymlService.getSections(localization, errMsg => toaster.error(toast, errMsg));
		catalogSections.value = await catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
		store.commit('setLoading', false);
		catalogSections.value.forEach(section => {
			section.checked = false;
			checkedSections.forEach(checkedSection => {
				if (checkedSection.section_id === section.id) section.checked = true;
			});
		});
	}
	isCatalogSectionsModalVisible.value = true;
};

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(ymlService);
watch(
	() => marker.value,
	async () => (ymls.value = ymls.value.filter(c => c.id !== itemId.value)),
);

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
