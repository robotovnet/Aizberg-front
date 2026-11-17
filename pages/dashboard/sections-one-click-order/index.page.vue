<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit" v-if="tree?.length && canView">
		<div class="list list--three list--directory list--short">
			<div class="list__topping">
				<span class="list__heading">{{ $t('text.subsections') }}</span>
				<span class="list__heading">{{ $t('text.display') }}</span>
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
							<button
								:disabled="!canEdit"
								class="dot dot--green"
								@click="switchDisplay(catalogSection.id)"
								:class="{ 'dot--red': !catalogSection.isActive }"
								:title="$t('text.turn_on')"></button>
						</span>
					</div>
					<template v-if="catalogSection.children?.length">
						<template v-for="(child, index) in catalogSection.children" :key="child.id">
							<div class="list__item" :class="{ 'list__item--last': index === catalogSection.children.length - 1 }">
								<span class="list__elem">
									<span>{{ child.name }}</span>
								</span>
								<span class="list__elem">
									<button
										:disabled="!canEdit"
										class="dot dot--green"
										@click="switchDisplay(child.id)"
										:class="{ 'dot--red': !child.isActive }"
										:title="$t('text.turn_on')"></button>
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
											<button
												:disabled="!canEdit"
												class="dot dot--green"
												@click="switchDisplay(subChild.id)"
												:class="{ 'dot--red': !subChild.isActive }"
												:title="$t('text.turn_on')"></button>
										</span>
									</div>
								</template>
							</template>
						</template>
					</template>
				</template>
			</div>
		</div>
		<div class="main__bottom" v-if="canEdit">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.email') }}</span>
				<input
					type="text"
					v-model="emails"
					class="main__input input"
					@input="error = null"
					:placeholder="currentEmails?.length ? currentEmails.map(e => `${e.email} `) : $t('text.email_placeholder')" />
				<span class="main__error main__error-message" v-if="error" v-html="error" />
			</div>
			<div class="main__inner main__inner--end">
				<button class="btn" @click="saveEmails">{{ $t('text.save_email') }}</button>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, onBeforeMount } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import catalogSectionsService from '../../../services/catalogSectionsService';
import useMakeTree from '../../../composables/pages/dashboard/catalogSections/useMakeTree';
import productTypesService from '../../../services/productTypesService';
import oneClickOrderService from '../../../services/oneClickOrderService';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const catalogSections = ref();
const activeCatalogSections = ref();
const productTypes = ref();
const emails = ref();
const error = ref<any>(null);
const errorNames = ['price_type_id', 'names.0.value', 'is_default'];
const { canEdit, canView, itemId } = usePageInit('orderoneclick');
let isClicked = false;

const { tree, makeTree } = useMakeTree();

const treeInit = async () => {
	catalogSections.value = await catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	productTypes.value = await productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', true);
	activeCatalogSections.value = await oneClickOrderService.getActiveCatalogSections(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
	catalogSections.value.forEach(section => {
		section.isActive = false;
		activeCatalogSections.value.forEach(aSection => {
			if (aSection.catalog_section_id === section.id) {
				section.isActive = true;
			}
		});
	});
	makeTree(catalogSections.value, productTypes.value);
};
const currentEmails = ref();
onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await treeInit();
	currentEmails.value = await oneClickOrderService.getSubscribers(localization, errMsg => toaster.error(toast, errMsg));
});

const getNestedSectionIds = id => {
	const ids = new Set([id]);
	let hasNewIds = true;
	while (hasNewIds) {
		hasNewIds = false;
		catalogSections.value.forEach(section => {
			if (ids.has(section.parent_section_id) && !ids.has(section.id)) {
				ids.add(section.id);
				hasNewIds = true;
			}
		});
	}
	return ids;
};

const emailValidation = (emailList: string[]): boolean => {
	const re = /\S+@\S+\.\S+/;
	if (emailList && Array.isArray(emailList)) {
		let canSave = false;
		for (const email of emailList) {
			if (!re.test(email)) {
				canSave = false;
				error.value = localization.t('text.email_error');
				return false;
			}
		}
		return true;
	}
	error.value = localization.t('text.email_empty');
	return false;
};

const switchDisplay = async id => {
	const arr: number[] = [];
	const currentSection = catalogSections.value.find(section => section.id === id);
	if (!currentSection) return;
	const isActive = !currentSection.isActive;
	const switchedSectionIds = currentSection.parent_section_id === null ? getNestedSectionIds(id) : new Set([id]);
	catalogSections.value.forEach(section => {
		if (switchedSectionIds.has(section.id)) {
			section.isActive = isActive;
		}
		if (section.isActive) {
			arr.push(section.id);
		}
	});
	store.commit('setLoading', true);
	await oneClickOrderService.setActiveCatalogSections(localization, { catalog_sections: arr }, errMsg => toaster.error(toast, errMsg));
	tree.value = [];
	makeTree(catalogSections.value, productTypes.value);
	store.commit('setLoading', false);
};

const saveEmails = async () => {
	isClicked = true;
	const emailList = emails.value?.split(',').map(item => item.trim());
	if (emailValidation(emailList)) {
		const response: any = await oneClickOrderService.setSubscribers(localization, { subscribers: emailList }, errMsg =>
			toaster.error(toast, errMsg),
		);
		if (response.message === 'success') {
			toaster.success(toast, localization.t('text.generalSuccessCreated'));
			emails.value = '';
			currentEmails.value = await oneClickOrderService.getSubscribers(localization, errMsg => toaster.error(toast, errMsg));
		}
	}
};

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
