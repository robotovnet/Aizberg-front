<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit">
		<div :key="setIdx" class="main__content" v-for="(setting, setIdx) in settings">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ setting.name }}</span>
				<div class="flex__column">
					<div :key="itemIdx" v-for="(item, itemIdx) in setting.items">
						<div class="main__block main__block--between mb-15" v-if="item.type_form_element === 'checkbox'">
							<div class="main__checkboxes">
								<label for="type-checkbox1" class="checkbox-group">
									<input
										type="checkbox"
										@click="updateSetting($event, item.id, 'checkbox')"
										id="type-checkbox1"
										class="checkbox-group__checkbox"
										:value="item.value"
										:checked="item.value === 'yes'" />
									<span>{{ item.name }}</span>
								</label>
							</div>
						</div>
						<div class="main__block main__block--between mb-15" v-if="item.type_form_element === 'select'">
							<span class="main__help">{{ item.name }}</span>
							<select class="main__select select" v-model="item.value" @change="updateSetting($event, item.id, 'select')">
								<option :key="idx" :value="it.value" v-for="(it, idx) in item.items">{{ it.header }}</option>
							</select>
						</div>
						<div class="main__block main__block--between mb-15" v-if="item.type_form_element === 'input'">
							<span class="main__help">{{ item.name }}</span>
							<input
								type="text"
								class="main__input input"
								:value="item.value"
								@blur="updateSetting($event, item.id, 'input')"
								placeholder="Сумма в рублях" />
						</div>
						<div class="main__block main__block--between mb-15" v-if="item.type_form_element === 'radio'">
							<span>{{ item.name }}</span>
							<div class="main__inner main__inner--end wrap">
								<label :key="idx" class="checkbox-group" v-for="(it, idx) in item.items">
									<input
										type="radio"
										:value="it.value"
										@click="updateSetting($event, item.id, 'radio')"
										name="status-product"
										v-model="item.value"
										class="checkbox-group__checkbox my-15" />
									<span>{{ it.header }}</span>
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from '@vue/runtime-core';
import { useStore } from 'vuex';
import viewPermissions from '../../../../utils/viewPermissions';
import sleep from '../../../../utils/sleep';
import { MainState } from '../../../../store/mainStore';
import settingsService from '../../../../services/settingsService';
import toaster from '../../../../utils/toaster';

const props = defineProps({
	fetchedSetting: {
		type: String,
		default: 0,
		required: true,
	},
});
const canEdit = ref(false);
const canView = ref(false);
const localization: any = useI18n();
const store = useStore<MainState>();
const settings = ref();
const toast = inject('toast') as any;
onBeforeMount(async () => {
	await sleep(1);
	store.commit('setLoading', true);
	const response = await settingsService.getAll(localization);
	response.forEach(setting => {
		setting.items.forEach(item => {
			item.items = JSON.parse(item.items);
		});
	});
	settings.value = [...response];
	store.commit('setLoading', false);
});
watch(
	async () => store.state.ready,
	async () => {
		// canView.value = viewPermissions.canView(store.state.permissions, 'settings.view');
		// if (!canView.value) {
		// 	window.location.replace('/dashboard');
		// }
		// canEdit.value = viewPermissions.canEdit(store.state.permissions, 'settings.management');
	},
);

const updateSetting = async (e, id, formElement) => {
	let value = { value: e.target.checked ? 'yes' : 'no' };
	// eslint-disable-next-line default-case
	switch (formElement) {
		case 'checkbox':
			value = { value: e.target.checked ? 'yes' : 'no' };
			break;
		case 'input':
			value = { value: e.target.value };
			break;
		case 'radio':
			value = { value: e.target.value };
			break;
		case 'select':
			value = { value: e.target.value };
			break;
	}

	store.commit('setLoading', true);
	const response = await settingsService.update(localization, id, value, errMsg => toaster.error(toast, errMsg));
	if (response.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
	}
	store.commit('setLoading', false);
};

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>
