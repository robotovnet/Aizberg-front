<template>
	<AppPage
		:button-text="$t('text.add_button')"
		:title="$t('text.header')"
		:handler="() => (window.location.href = '/dashboard/bonus-program/item')"
		:canEdit="canEdit">
		<div class="list list--six">
			<div class="list__topping">
				<button class="list__heading list__heading--sort" @click="sortByName" :title="$t('text.by_alphabet')">
					{{ $t('text.level_name') }}
				</button>
				<button class="list__heading list__heading--sort" @click="sortByType" :title="$t('text.by_alphabet')">
					{{ $t('text.client_types') }}
				</button>
				<span class="list__heading">{{ $t('text.next_level') }} </span>
				<span class="list__heading">{{ $t('text.one_order') }}</span>
				<span class="list__heading" v-if="canEdit">{{ $t('text.start') }}</span>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			<div class="list__item" v-for="(level, index) in levels" :key="index">
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						@click="() => (window.location.href = `/dashboard/bonus-program/item?edit=${level.id}`)"
						class="list__edit mr-20"
						:title="$t('text.edit')"></button>
					{{ level.name }}
				</span>
				<span class="list__elem">{{ level.clientTypeName }}</span>
				<span class="list__elem">{{ level.amount_up }}</span>
				<span class="list__elem">{{ level.amount_instantly_up }}</span>
				<span class="list__elem" v-if="canEdit">
					<div v-if="level?.is_entry === 'N'" @click="setStartLevel(level)" class="dot dot--red pointer" title="Включить"></div>
					<div v-else class="dot dot--green"></div>
				</span>
				<span
					class="list__elem"
					v-if="levels.reduce((acc, curr) => (acc.level_num > curr.level_num ? acc : curr)).id !== level.id"></span>
				<span class="list__elem" v-else>
					<button
						:disabled="!canEdit"
						class="cross"
						@click="onConfirmDelete(level?.id, level?.name)"
						:title="$t('text.remove')"></button>
				</span>
			</div>
		</div>

		<div class="main__bottom">
			<div class="main__inner main__inner--end">
				<span class="main__text">{{ $t('text.estimated_number') }}</span>
				<select :disabled="!canEdit" class="main__select select" @change="setEstimatedNumber" v-model="estimatedNumber">
					<option :value="day" v-for="(day, index) in 31" :key="index">{{ day }}</option>
				</select>
			</div>
			<template v-if="notParticipatingSections.length">
				<h3 class="main__title">{{ $t('text.bonus_program_category') }}</h3>
				<ul class="category">
					<li class="category__item" v-for="(section, index) in notParticipatingSections" :key="index">
						<a href="#" @click="removeSection(section.id)" class="category__link">{{ section.name }}</a>
					</li>
				</ul>
				<button @click="showCatalogSectionsModal" class="main__btn main__btn--add modal-btn">{{ $t('text.add_category') }}</button>
			</template>
		</div>
		<catalog-sections-modal
			:is-visible="isCatalogSectionsModalVisible"
			:catalogSections="catalogSections"
			:product-types="productTypes"
			@update="updateNotParticipatingSections"
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
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import CatalogSectionsModal from '../../_components/dashboard/CatalogSectionsModal.vue';
import AskDialog from '../../_components/AskDialog.vue';
import toaster from '../../../utils/toaster';
import bonusProgramService from '../../../services/bonusProgramService';
import clientTypesService from '../../../services/clientTypesService';
import catalogSectionsService from '../../../services/catalogSectionsService';
import sleep from '../../../utils/sleep';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import productTypesService from '../../../services/productTypesService';
import sort from '../../../utils/onSort';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const brands = ref();
const estimatedNumber = ref(1);
const errorNames = ['price_type_id', 'names.0.value'];

const { canEdit, canView } = usePageInit('bonusprogram.level');
const isCatalogSectionsModalVisible = ref(false);
const catalogSections = ref();
const productTypes = ref();
const levels = ref();

const setStartLevel = async level => {
	const sendData = {
		names: [
			{
				lang: localization.locale.value,
				value: level.name,
			},
		],
		client_type_id: level.client_type_id,
		level_num: level.level_num,
		amount_up: level.amount_up,
		amount_instantly_up: level.amount_instantly_up,
		is_entry: level.is_entry === 'Y' ? 'N' : 'Y',
		calculation_period: level.calculation_period,
	};
	store.commit('setLoading', true);
	const response: any = await bonusProgramService.update(localization, level.id, sendData, errorNames, errMsg => {
		toaster.error(toast, errMsg);
		store.commit('setLoading', false);
	});
	levels.value = await bonusProgramService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	levels.value.forEach(level => {
		level.clientTypeName = '';
		level.clientTypeName = clientTypes.value.find(type => type.id === level.client_type_id)?.name;
	});
	store.commit('setLoading', false);
};
const notParticipatingSections = ref<any>([]);
const estimatedSettings: any = ref();
const clientTypes = ref();

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	let fetchedBlockedSections: any = '';
	let checkedSections: any = '';
	Promise.all([
		clientTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		bonusProgramService.getBlockedSections(localization, errMsg => toaster.error(toast, errMsg)),
		bonusProgramService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		bonusProgramService.getBlockedSections(localization, errMsg => toaster.error(toast, errMsg)),
		productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
	])
		.then(value => {
			clientTypes.value = value[0];
			catalogSections.value = value[1];
			fetchedBlockedSections = value[2];
			levels.value = value[3];
			checkedSections = value[4];
			productTypes.value = value[5];
		})
		.then(() => store.commit('setLoading', false))
		.then(() =>
			catalogSections.value.forEach(section => {
				section.checked = false;
				checkedSections.forEach(checkedSection => {
					if (checkedSection.section_id === section.id) section.checked = true;
				});
			}),
		)
		.then(() => {
			fetchedBlockedSections.forEach(fetchedBlockedSection => {
				catalogSections.value.forEach(fetchedSection => {
					if (fetchedBlockedSection.section_id === fetchedSection.id) {
						notParticipatingSections.value.push({
							id: fetchedSection.id,
							name: fetchedSection.name,
						});
					}
				});
			});
		})
		.then(() => {
			levels.value.forEach(level => {
				level.clientTypeName = '';
				level.clientTypeName = clientTypes.value.find(type => type.id === level.client_type_id)?.name;
			});
		});

	estimatedSettings.value = await bonusProgramService.getEstimatedNumber(localization, errMsg => toaster.error(toast, errMsg));
	estimatedNumber.value = estimatedSettings.value.value;
});
const setEstimatedNumber = async () => {
	store.commit('setLoading', true);
	const response: any = await bonusProgramService.setEstimatedNumber(
		localization,
		estimatedSettings.value.id,
		{ value: estimatedNumber.value.toString() },
		errMsg => toaster.error(toast, errMsg),
	);
	store.commit('setLoading', false);
	response.message === 'success'
		? toaster.success(toast, localization.t('text.generalSuccessUpdated'))
		: toaster.error(toast, localization.t('text.unknownError'));
};
const removeSection = async id => {
	notParticipatingSections.value = notParticipatingSections.value.filter(section => section.id !== id);
	store.commit('setLoading', true);
	const response: any = await bonusProgramService.setBlockedSections(
		localization,
		{ sections: notParticipatingSections.value.map(item => item.id) },
		errMsg => toaster.error(toast, errMsg),
	);
	store.commit('setLoading', false);
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
	}
};

const showCatalogSectionsModal = () => {
	isCatalogSectionsModalVisible.value = true;
};
const updateNotParticipatingSections = async sectionIds => {
	store.commit('setLoading', true);
	const response: any = await bonusProgramService.setBlockedSections(localization, { sections: sectionIds }, errMsg =>
		toaster.error(toast, errMsg),
	);
	const checkedSections: any = await bonusProgramService.getBlockedSections(localization, errMsg => toaster.error(toast, errMsg));
	notParticipatingSections.value = [];
	catalogSections.value.forEach(section => {
		section.checked = false;
		checkedSections.forEach(checkedSection => {
			if (checkedSection.section_id === section.id) {
				section.checked = true;
				notParticipatingSections.value.push({
					id: section.id,
					name: section.name,
				});
			}
		});
	});
	store.commit('setLoading', false);
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		isCatalogSectionsModalVisible.value = false;
	}
};
onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
const sortByName = () => sort(true, levels.value, 'level_name_sort', 'name');
const sortByType = () => sort(true, levels.value, 'level_type_sort', 'clientTypeName');
const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(bonusProgramService);
watch(
	() => marker.value,
	async () => (levels.value = levels.value.filter(c => c.id !== itemId.value)),
);
</script>

<style scoped>
.ref-link {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 180px;
}
</style>
