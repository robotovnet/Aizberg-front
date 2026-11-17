<template>
	<AppPage
		:title="$t('text.header')"
		:canEdit="canEdit"
		:handler="() => link('/dashboard/catalog-sections/item')"
		:button-text="$t('text.add_button')"
		v-if="canView">
		<div class="list list--four list--directory">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.subsections') }}</span>
				<span class="list__heading">{{ $t('text.good_type') }}</span>
				<span class="list__heading" style='position: relative; left: -30px;' v-html="$t('text.active_characteristic')"></span>
				<span class="list__heading" style='position: relative; left: -11px;' v-html="$t('text.bp')"></span>
				<span class="list__heading" style='position: relative; left: -11px;'>{{ $t('text.display') }}</span>
				<span class="list__heading" style='position: relative; left: -11px;'>{{ $t('text.not_for_all') }}</span>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			<div class="list__wrap">
				<template v-for="catalogSection in tree">
					<div class="list__drop list__drop--main" v-if="catalogSection.parent_section_id === null" :key="catalogSection.id">
						<div>
							<div class="list__item list__item--main" :class="{ ns: !catalogSection.children?.length }">
								<span class="list__elem">
									<button
										:disabled="!canEdit"
										class="list__edit"
										@click="link(`/dashboard/catalog-sections/item?edit=${catalogSection?.id}`)"
										:title="$t('text.edit')"></button>
									<span>{{ catalogSection.name }}</span>
								</span>
								<span class="list__elem">{{ catalogSection.product_name }}</span>

								<span class="list__elem">
									<button
										:disabled="!canEdit"
										class="dot"
										:class="{
											'dot--red': catalogSection?.is_active_tab_parameters === 'N',
											'dot--green': catalogSection?.is_active_tab_parameters === 'Y',
										}"
										@click="changeData(catalogSection, 'is_active_tab_parameters')"
										:title="$t('text.turn_on')"></button>
								</span>
								<span class="list__elem">
									<button
										:disabled="!canEdit"
										class="dot"
										:class="{
											'dot--red': catalogSection?.is_bp_disabled === 'Y',
											'dot--green': catalogSection?.is_bp_disabled === 'N',
										}"
										@click="changeData(catalogSection, 'is_bp_disabled')"
										:title="$t('text.turn_on')"></button>
								</span>
								
								<span class="list__elem">
									<button
										:disabled="!canEdit"
										class="dot"
										:class="{
											'dot--red': catalogSection?.is_hidden === 'Y',
											'dot--green': catalogSection?.is_hidden === 'N',
										}"
										@click="changeData(catalogSection, 'is_hidden')"
										:title="$t('text.turn_on')"></button>
								</span>
								<span class="list__elem">
									<button
										:disabled="!canEdit"
										class="dot"
										:class="{
											'dot--red': catalogSection?.not_for_everyone === 'Y',
											'dot--green': catalogSection?.not_for_everyone === 'N',
										}"
										@click="changeData(catalogSection, 'not_for_everyone')"
										:title="$t('text.turn_on')"></button>
								</span>
								<span class="list__elem">
									<button
										:disabled="!canEdit"
										class="cross"
										@click="onConfirmDelete(catalogSection?.id, catalogSection?.name)"
										:title="$t('text.remove')"></button>
								</span>
							</div>
						</div>
					</div>
					<template v-if="catalogSection.children?.length">
						<div v-for="(child, index) in catalogSection.children" :key="child.id">
							<div class="list__drop" :class="{ 'list__drop--last': index === catalogSection.children.length - 1 }">
								<div class="list__item" :class="{ 'list__item--last': index === catalogSection.children.length - 1 }">
									<span class="list__elem">
										<button
											:disabled="!canEdit"
											class="list__edit"
											:title="$t('text.edit')"
											@click="link(`/dashboard/catalog-sections/item?edit=${child?.id}`)"></button>
										<span>{{ child.name }}</span>
									</span>
									<span class="list__elem">
										{{ child.product_name }}
									</span>
									<span class="list__elem">
										<button
											:disabled="!canEdit"
											class="dot"
											:class="{ 'dot--red': child?.is_active_tab_parameters === 'N', 'dot--green': child?.is_active_tab_parameters === 'Y' }"
											@click="changeData(child, 'is_active_tab_parameters')"
											:title="$t('text.turn_on')"></button>
									</span>
									<span class="list__elem">
										<button
											:disabled="!canEdit"
											class="dot"
											:class="{ 'dot--red': child?.is_bp_disabled === 'Y', 'dot--green': child?.is_bp_disabled === 'N' }"
											@click="changeData(child, 'is_bp_disabled')"
											:title="$t('text.turn_on')"></button>
									</span>
									<span class="list__elem">
										<button
											:disabled="!canEdit"
											class="dot"
											:class="{ 'dot--red': child?.is_hidden === 'Y', 'dot--green': child?.is_hidden === 'N' }"
											@click="changeData(child, 'is_hidden')"
											:title="$t('text.turn_on')"></button>
									</span>
									<span class="list__elem">
										<button
											:disabled="!canEdit"
											class="dot"
											:class="{ 'dot--red': child?.not_for_everyone === 'Y', 'dot--green': child?.not_for_everyone === 'N' }"
											@click="changeData(child, 'not_for_everyone')"
											:title="$t('text.turn_on')"></button>
									</span>
									<span class="list__elem">
										<button
											:disabled="!canEdit"
											class="cross"
											@click="onConfirmDelete(child?.id, child?.name)"
											:title="$t('text.remove')"></button>
									</span>
								</div>
							</div>
							<template v-if="child.children?.length">
								<div
									class="list__drop"
									v-for="(subChild, idx) in child.children"
									:class="{ 'list__drop--last': index === catalogSection.children.length - 1 }"
									:key="subChild.id">
									<div
										class="list__item list__item--sub"
										:class="{ 'list__item--last': idx === child.children.length - 1 }">
										<span class="list__elem">
											<button
												:disabled="!canEdit"
												class="list__edit"
												:title="$t('text.edit')"
												@click="link(`/dashboard/catalog-sections/item?edit=${subChild?.id}`)"></button>
											<span>{{ subChild.name }}</span>
										</span>
										<span class="list__elem">{{ subChild.product_name }}</span>
										<span class="list__elem">
											<button
												:disabled="!canEdit"
												class="dot"
												:class="{
													'dot--red': subChild?.is_active_tab_parameters === 'N',
													'dot--green': subChild?.is_active_tab_parameters === 'Y',
												}"
												@click="changeData(subChild, 'is_active_tab_parameters')"
												:title="$t('text.turn_on')"></button>
										</span>
										<span class="list__elem">
											<button
												:disabled="!canEdit"
												class="dot"
												:class="{
													'dot--red': subChild?.is_bp_disabled === 'Y',
													'dot--green': subChild?.is_bp_disabled === 'N',
												}"
												@click="changeData(subChild, 'is_bp_disabled')"
												:title="$t('text.turn_on')"></button>
										</span>
										<span class="list__elem">
											<button
												:disabled="!canEdit"
												class="dot"
												:class="{
													'dot--red': subChild?.is_hidden === 'Y',
													'dot--green': subChild?.is_hidden === 'N',
												}"
												@click="changeData(subChild, 'is_hidden')"
												:title="$t('text.turn_on')"></button>
										</span>
										<span class="list__elem">
											<button
												:disabled="!canEdit"
												class="dot"
												:class="{
													'dot--red': subChild?.not_for_everyone === 'Y',
													'dot--green': subChild?.not_for_everyone === 'N',
												}"
												@click="changeData(subChild, 'not_for_everyone')"
												:title="$t('text.turn_on')"></button>
										</span>
										<span class="list__elem">
											<button
												:disabled="!canEdit"
												class="cross"
												@click="onConfirmDelete(subChild?.id, subChild?.name)"
												:title="$t('text.remove')"></button>
										</span>
									</div>
								</div>
							</template>
						</div>
					</template>
				</template>
			</div>
		</div>
		<div class="main__bottom">
			<div class="main__inner main__inner--end" v-if="canEdit">
				<button @click="() => redirect('/dashboard/catalog-sections/order')" class="btn">
					{{ $t('text.set_order') }}
				</button>
			</div>
		</div>
		<AskDialog
			:deleteId="itemId?.toString()"
			:title="$t('text.dialog_delete_title')"
			:question="`${$t('text.dialog_delete_question')} ${itemName}?`"
			:onConfirm="onDelete" />
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import useMakeTree from '../../../composables/pages/dashboard/catalogSections/useMakeTree';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import toaster from '../../../utils/toaster';
import AskDialog from '../../_components/AskDialog.vue';
import catalogSectionsService from '../../../services/catalogSectionsService';
import productTypesService from '../../../services/productTypesService';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const pickupPoints = ref();
const companies = ref();
const catalogSections = ref();
const productTypes = ref();

const { tree, makeTree } = useMakeTree();
const link = redirect;
const { canEdit, canView } = usePageInit('catalog.sections');
onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await treeInit();
});

const treeInit = async () => {
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	])
		.then(values => ([catalogSections.value, productTypes.value] = [...values]))
		.then(() => {
			makeTree(catalogSections.value, productTypes.value);
		})
		.then(() => store.commit('setLoading', false));
};

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(catalogSectionsService);
watch(
	() => marker.value,
	async () => {
		tree.value = [];
		await treeInit();
	},
);

const sendData = (catalogSection, fieldChanging) => ({
	names: [
		{
			lang: localization.locale.value,
			value: catalogSection.name,
		},
	],
	parent_section_id: catalogSection.parent_section_id,
	product_group_id: catalogSection.product_group_id,
	is_hidden: (fieldChanging === 'is_hidden') ? (catalogSection.is_hidden === 'N' ? 'Y' : 'N') : catalogSection.is_hidden,
	is_active_tab_parameters: (fieldChanging === 'is_active_tab_parameters') ? (catalogSection.is_active_tab_parameters === 'N' ? 'Y' : 'N') : catalogSection.is_active_tab_parameters,
	is_bp_disabled: (fieldChanging === 'is_bp_disabled') ? (catalogSection.is_bp_disabled === 'N' ? 'Y' : 'N') : catalogSection.is_bp_disabled,
	not_for_everyone: (fieldChanging === 'not_for_everyone') ? (catalogSection.not_for_everyone === 'N' ? 'Y' : 'N') : catalogSection.not_for_everyone,
	sorting_method: catalogSection.sorting_method,
	order: catalogSection.order,
});

const changeData = async (catalogSection, fieldChanging) => {
	store.commit('setLoading', true);
	
	console.log(sendData(catalogSection, fieldChanging));
	console.log(catalogSection);
	
	const response: any = await catalogSectionsService.update(localization, catalogSection.id, sendData(catalogSection, fieldChanging), [], errMsg => {
		toaster.error(toast, errMsg);
		store.commit('setLoading', false);
	});
	if (response.message === 'success') {
		tree.value = [];
		await treeInit();
		// toaster.success(toast, localization.t('text.generalSuccessUpdated'));
	}
	store.commit('setLoading', false);
};

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>

<style>
.list--four .list__heading:nth-child(4), .list--four .list__elem:nth-child(4) {
    margin-left: 25px;
    max-width: 40px;
    text-align: center;
}

.list--four .list__heading:nth-child(5), .list--four .list__elem:nth-child(5) {
    margin-left: 25px;
    max-width: 40px;
    text-align: center;
}

.list--four .list__heading:nth-child(6), .list--four .list__elem:nth-child(6) {
    margin-left: 25px;
    max-width: 40px;
    text-align: center;
}

.list--four .list__heading:nth-child(7), .list--four .list__elem:nth-child(7) {
    margin-left: 25px;
    max-width: 40px;
    text-align: center;
}

.list--four .list__heading:nth-child(3), .list--four .list__elem:nth-child(3) {
    margin-left: 25px;
    max-width: 40px;
    text-align: center;
}

.list--four .list__heading:nth-child(2), .list--four .list__elem:nth-child(2) {
    margin-left: 25px;
    max-width: 175px;
}
</style>
