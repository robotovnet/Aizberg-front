<template>
	<AppPage :title="$t('text.order')" :canEdit="canEdit">
		<div class="list list--four list--directory">
			<div class="list__wrap">
				<template v-for="(catalogSection, catalogSectionIdx) in tree">
					<div :key="catalogSectionIdx" class="list__drop list__drop--main" v-if="catalogSection.parent_section_id === null">
						<div>
							<div
								class="list__item list__item--main"
								:class="{ ns: !catalogSection.children?.length }">
								<span class="list__elem">
									<select style='min-width: auto; margin-right: 12px;'
										@change="updateOrderSectionsParent(catalogSection, $event, null)"
										class="main__select select parent_select">
										<option v-for="(, indx) in getOnlyParentItems(tree)" 
											:selected="indx===catalogSectionIdx"
											:value="(indx + 1)">{{ (indx + 1) }}</option>
									</select>
									<span>{{ catalogSection.name }}</span>
								</span>
								<span class="list__elem"></span>
							</div>
						</div>
					</div>
					<template v-if="catalogSection.children?.length">
						<template :key="index" v-for="(child, index) in catalogSection.children">
							<div
								class="list__drop"
								:class="{ 'list__drop--last': index === catalogSection.children.length - 1 }">
								<div
									class="list__item"
									:class="{ 'list__item--last': index === catalogSection.children.length - 1 }">
									<span class="list__elem">
										<span class='pre_line_child'></span>
										<select style='min-width: auto; margin-right: 12px; margin-left: 10px;'
											@change="updateOrderSectionsChild(catalogSectionIdx, child, catalogSection, $event, null)"
											:class="`main__select select child_select child_select_${catalogSectionIdx}`">
											<option v-for="(, indx) in catalogSection.children" 
												:selected="indx===index"
												:value="(indx + 1)">{{ catalogSectionIdx +1 }}.{{ (indx + 1) }}</option>
										</select>
										<span>{{ child.name }}</span>
									</span>
									<span class="list__elem"></span>
								</div>
							</div>
							<template v-if="child.children?.length">
								<div
									:key="index"
									class="list__drop"
									v-for="(subChild, idx) in child.children"
									:class="{ 'list__drop--last': index === catalogSection.children.length - 1 }">
									<div
										class="list__item list__item--sub"
										:class="{ 'list__item--last': idx === child.children.length - 1 }">
										<span class="list__elem">
											<span class='pre_line_child2'></span>
											<select style='min-width: auto; margin-right: 12px; margin-left: 90px;'
												@change="updateOrderSectionsChild(catalogSectionIdx+'_'+index, subChild, child, $event, null)"
												:class="`main__select select child_select child_select_${catalogSectionIdx}_${index}`">
												<option v-for="(, indx) in child.children" 
													:selected="indx===idx"
													:value="(indx + 1)">{{ catalogSectionIdx + 1 }}.{{ index + 1 }}.{{ (indx + 1) }}</option>
											</select>
											<span>{{ subChild.name }}</span>
										</span>
										<span class="list__elem"></span>
									</div>
								</div>
							</template>
						</template>
					</template>
				</template>
			</div>
		</div>
		<div class="main__bottom">
			<div class="main__inner main__inner--end" v-if="canEdit">
				<button class="btn" @click="save">{{ $t('text.save_order') }}</button>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import viewPermissions from '../../../utils/viewPermissions';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
	
import toaster from '../../../utils/toaster';
import catalogSectionsService from '../../../services/catalogSectionsService';
import useMakeTree from '../../../composables/pages/dashboard/catalogSections/useMakeTree';
import productTypesService from '../../../services/productTypesService';

//const canEdit = ref();
//const canView = ref();
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const pickupPoints = ref();
const companies = ref();
const catalogSections = ref();

const { canEdit, canView } = usePageInit('catalog.sections');
const { tree, makeTree } = useMakeTree();

const draggedParentId = ref();
const dragStart = (e, section) => {
	draggedParentId.value = section.parent_section_id;
	e.dataTransfer.setData('section', JSON.stringify(section));
};

const getOnlyParentItems = (arr) => {
	return arr.filter(catalogSection => catalogSection.parent_section_id === null);
}

const updateOrderSectionsParent = async (catalog_section_item, event, pos) => {
	if (canEdit.value) {
		const totalItems = tree.value.length;
		const tempArr = tree.value.filter(catalog_section => catalog_section.id !== catalog_section_item.id);
		
		if (pos == null) {
			tempArr.splice(event.target.value - 1, 0, catalog_section_item);
		} else {
			if (pos == 0) {
				pos = totalItems;
			}
	
			if (pos > totalItems) {
				pos = 1;
			}
	
			tempArr.splice(pos - 1, 0, catalog_section_item);
		}
	
		tempArr.forEach((item, index) => (item.order = (index + 1).toString()));
		tree.value = tempArr;

		const parentSelects = document.getElementsByClassName("parent_select");
		for (let i = 0; i < parentSelects.length; i++) {
			parentSelects[i].selectedIndex = i;
		}
	}
};

const updateOrderSectionsChild = async (key, child, section, event, pos) => {
	if (canEdit.value) {
		const totalItems = section.children.length;
		const tempArr = section.children.filter(catalog_section => catalog_section.id !== child.id);
		
		if (pos == null) {
			tempArr.splice(event.target.value - 1, 0, child);
		} else {
			if (pos == 0) {
				pos = totalItems;
			}
	
			if (pos > totalItems) {
				pos = 1;
			}
	
			tempArr.splice(pos - 1, 0, child);
		}
	
		tempArr.forEach((item, index) => (item.order = (index + 1).toString()));
		section.children = tempArr;

		const parentSelects = document.getElementsByClassName("child_select_" + key);
		for (let i = 0; i < parentSelects.length; i++) {
			parentSelects[i].selectedIndex = i;
		}
	}
};

const dragOver = (e, section) => {
	if (draggedParentId.value !== section.parent_section_id) {
		e.dataTransfer.dropEffect = 'none';
		e.dataTransfer.effectAllowed = 'none';
	}
};
/* eslint-disable */
const dropOnParent = (e, onDropEl) => {
	const draggedElement = JSON.parse(e.dataTransfer.getData('section'));
	const tempArr = tree.value.filter(company => company.order !== draggedElement.order);
	tempArr.splice(onDropEl.order - 1, 0, draggedElement);

	tempArr.forEach((item, index) => (item.order = index + 1));
	tree.value = JSON.parse(JSON.stringify(tempArr));
};

const dropOnChild = (e, section, child) => {
	const draggedElement = JSON.parse(e.dataTransfer.getData('section'));
	const tempArr = child.children.filter(section => section.order !== draggedElement.order);
	tempArr.splice(section.order - 1, 0, draggedElement);
	tempArr.forEach((item, index) => (item.order = index + 1));
	child.children = JSON.parse(JSON.stringify(tempArr));
};
const errorNames = [
	'is_hidden',
	'names',
	'names.0.lang',
	'names.0.value',
	'order',
	'parent_section_id',
	'product_group_id',
	'sorting_method',
	'seo',
	'seo.desc',
	'seo.starting_phrases',
];
const sendData = ref([]) as any;
const save = async () => {
	const tempArr: any = [];
	for (const branch of tree.value) {
		tempArr.push(branch);
		for (const subBranch of branch.children) {
			tempArr.push(subBranch);
			for (const subSubBranch of subBranch.children) {
				tempArr.push(subSubBranch);
			}
		}
	}
	sendData.value = tempArr.map(item => ({
		section_id: item.id,
		order: item.order,
	}));
	const obr = {
		order: sendData.value,
	};
	store.commit('setLoading', true);
	const response = await catalogSectionsService.changeOrder(localization, obr, errMsg => toaster.error(toast, errMsg));
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		window.location.replace('/dashboard/catalog-sections');
	}
	store.commit('setLoading', false);
};
const productTypes = ref();
onBeforeMount(async () => {
	//canView.value = await viewPermissions.canView(store.state.permissions, 'catalog.sections.view');
	//canEdit.value = await viewPermissions.canEdit(store.state.permissions, 'catalog.sections.management');
	//if (!canView.value) {
	//	alert('Переброс');
	//	window.location.replace('/dashboard');
	//}
	
	catalogSections.value = await catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	productTypes.value = await productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	await makeTree(catalogSections.value, productTypes.value);
});

onMounted(() => {
	document.title += ` - ${localization.t('text.order')}`;
});
</script>
<style>
.pre_line_child:after, .pre_line_child2:after {
    content: "";
    position: absolute;
    top: 50%;
    left: 54px;
    transform: translateY(-50%);
    display: block;
    width: 5px;
    height: 2px;
    background: #428AB4;
}

.pre_line_child2:after {
	left: 72px;
}

.list--directory .list__item:not(.list__item--main) .list__elem span:last-child:after {
	width: 0px;
	height: 0px;
}

.list--directory .list__item:not(.list__item--main) .list__elem span:last-child {
	padding-left: 0px;
}

.pre_line_child {
	margin-left: 60px;
}
</style>
