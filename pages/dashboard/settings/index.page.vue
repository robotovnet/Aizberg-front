<template>
	<AppPage :title="$t('text.header')" :canEdit="canEdit" v-if="canView">
		<div :key="setting.id" class="main__content" v-for="setting in settings">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ setting.name }}</span>
				<div class="flex__column">
					<template :key="item.id" v-for="item in setting.items">
						<div class="main__block main__block--between mb-15" v-if="item.type_form_element === 'checkbox'">
							<div class="main__checkboxes">
								<label for="type-checkbox1" class="checkbox-group">
									<input
										:disabled="!canEdit"
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
							<select
								:disabled="!canEdit"
								class="main__select select"
								v-model="item.value"
								@change="updateSetting($event, item.id, 'select')">
								<option :key="it" :value="it.value" v-for="it in item.items">{{ it.header }}</option>
							</select>
						</div>

						<div class="main__block main__block--between mb-15" v-if="item.type_form_element === 'input'">
							<span class="main__help">{{ item.name }}</span>
							<input
								:disabled="!canEdit"
								type="text"
								class="main__input input"
								:value="item.value"
								@blur="updateSetting($event, item.id, 'input')"
								placeholder="Сумма в рублях" />
						</div>
						<div class="main__block main__block--between mb-15" v-if="item.type_form_element === 'radio'">
							<span>{{ item.name }}</span>
							<div class="main__inner main__inner--end wrap">
								<label :key="it" class="checkbox-group" v-for="it in item.items">
									<input
										:disabled="!canEdit"
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
					</template>
				</div>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from '@vue/runtime-core';
import { useStore } from 'vuex';
import viewPermissions from '../../../utils/viewPermissions';
import redirect from '../../../utils/redirect';
import { MainState } from '../../../store/mainStore';
import settingsService from '../../../services/settingsService';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';

const localization: any = useI18n();
const store = useStore<MainState>();
const settings = ref();
const toast = inject('toast') as any;
const { canEdit, canView } = usePageInit('settings');
onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');

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

const updateSetting = async (e, id, formElement) => {
	let value = { value: e.target.checked ? 'yes' : 'no' };
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
