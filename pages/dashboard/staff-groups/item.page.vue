<template>
	<main class="main">
		<div class="main__top">
			<h1>{{ header }}</h1>
		</div>
		<div class="main__sub"></div>
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.name_of_group') }}</span>
				<input
					v-model="inputGroupName"
					type="text"
					class="main__input input"
					:class="clsErr"
					:placeholder="$t('text.group_name_placeholder')" />
				<div class="main__error-message" v-html="errMsg" />
			</div>
			<h3 class="main__title main__title--mt">{{ $t('text.group_permissions') }}:</h3>
			<div class="main__wrapper main__wrapper--flex">
				<div v-for="(group, groupName, i) in groups" :key="`g${i}`" class="main__checkbox-group">
					<label class="checkbox-group checkbox-group--heading">
						<span>{{ groupName }}</span>
						<input
							type="checkbox"
							v-model="groupChecked[i]"
							v-on:click="markGroup($event.target.checked, groupName)"
							class="checkbox-group__checkbox" />
					</label>
					<label v-for="(item, j) in group" :key="j" class="checkbox-group">
						<input
							type="checkbox"
							v-model="itemChecked[groupName][j]"
							v-on:click="markItem(groupName, $event.target.checked, item.policy, i, group)"
							class="checkbox-group__checkbox" />
						<span>{{ item.name }}</span>
					</label>
					<br /><br /><br />
				</div>
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.default_page') }}</span>

				<select
					@change="addDefaultPage"
					v-model="currentDefaultPage"
					class="main__select main__select--ultra select ml-15"
					:class="{ 'select--error': false }">
					<option value="0">Выберите страницу по умолчанию</option>
					<option v-for="page in defaultPages" :key="page.policy" :value="page.policy">{{ page.name }}</option>
				</select>
				<span class="main__error main__error-message">{{ startPolicyError }}</span>
			</div>
			<div class="main__inner main__inner--end main__inner--mt">
				<button v-on:click="addGroup" class="btn">
					{{ isEditMode ? $t('text.save_group_button') : $t('text.add_group_button') }}
				</button>
			</div>
		</div>
	</main>
</template>

<script lang="ts">
import { computed, inject, nextTick, onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { MainState } from '../../../store/mainStore';
import sleep from '../../../utils/sleep';
import getValidator from '../../../validation/getValidator';
import fetchApi from '../../../network/fetchEndpoint';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import redirect from '../../../utils/redirect';
export default {
	setup() {
		const localization = useI18n();
		const store = useStore<MainState>();
		const toast = inject('toast') as any;
		const groups = ref({});
		let lastError = undefined;
		let selectedPermissions: Array<{ policy: string }> = [];
		const groupChecked = reactive([]);
		const itemChecked = reactive({});
		const disabled = ref(true);
		const inputGroupName = ref('');
		const isEditMode = ref(false);
		const errMsg = ref('&nbsp;');
		const notAllowEditGroup = ref(true);
		let editGroupId = undefined;

		const createValidator = () => {
			const validation = store.state.currentValidation;
			if (validation) {
				const data = {
					name: inputGroupName.value,
					permissions: selectedPermissions,
					start_policy: currentDefaultPage.value,
				};
				return getValidator(data as any, validation);
			}
			return undefined;
		};

		const onError = (err: string, reload: boolean) => {
			lastError?.destroy();
			setTimeout(() => {
				lastError = toast.error(err, {
					duration: false,
					dismissible: true,
					onClose: () => {
						if (reload) location.reload();
					},
					position: 'bottom',
				});
			}, 500);
			store.commit('setLoading', false);
			disabled.value = false;
		};

		const onNameError = (err: string) => {
			errMsg.value = err;
			scrollToTop();
			store.commit('setLoading', false);
		};
		const startPolicyError = ref('');
		const onStartPolicyError = (err: string) => {
			startPolicyError.value = err;
			store.commit('setLoading', false);
		};

		const groupBy = (items: Array<any>, key: string) => {
			return items.reduce((acc, item) => {
				(acc[item[key]] = acc[item[key]] || []).push(item);
				// delete item[key];
				return acc;
			}, {});
		};

		watch(inputGroupName, () => {
			lastError?.destroy();
			errMsg.value = '&nbsp;';
			disabled.value = selectedPermissions.length == 0 || inputGroupName.value.trim().length == 0;
		});
		watch(itemChecked, () => {
			defaultPages.value = [];
			const selectedViewsPermissions = selectedPermissions.filter(permission => permission.policy.endsWith('view'));
			fetchedDefaultPages.value.forEach(page => {
				return selectedViewsPermissions.map(permission => {
					if (permission.policy === page.policy) {
						defaultPages.value.push(page);
					}
				});
			});
		});

		const populatePermissions = (grps: {}) => {
			selectedPermissions = [];
			for (const group in grps)
				for (const item in grps[group]) {
					const index = parseInt(item);
					if (itemChecked[group][index]) {
						selectedPermissions.push({ policy: grps[group][index].policy });
					}
				}
			disabled.value = selectedPermissions.length == 0 || inputGroupName.value.trim().length == 0;
		};

		const scrollToTop = () => {
			window.scroll(0, 0);
			if (document.body?.scrollTop) document.body.scrollTop = 0;
			else if (document.documentElement?.scrollTop) document.documentElement.scrollTop = 0;
		};
		const startPolicy = ref({});
		const addDefaultPage = () => {
			startPolicy.value = currentDefaultPage.value;
			startPolicyError.value = '';
		};
		const verifyPermissions = (isEditMode: boolean) => {
			let allowViewGroup = false;
			store.state.permissions?.forEach(permission => {
				if (permission.policy === 'staff.groups.management') notAllowEditGroup.value = false;
				if (permission.policy === 'staff.groups.view') allowViewGroup = true;
			});
			return true;
		};
		const { canEdit, canView } = usePageInit('staff.groups');
		const defaultPages = ref([]);
		const fetchedDefaultPages = ref([]);
		const currentDefaultPage = ref('0');
		onBeforeMount(async () => {
			if (!canEdit.value) redirect('/dashboard/staff-groups');
			const urlParams = new URLSearchParams(window.location.search);
			editGroupId = urlParams.get('edit');
			isEditMode.value = editGroupId ? true : false;
			if (!verifyPermissions(isEditMode.value)) return;
			await sleep(1);
			store.commit('setLoading', true);
			const permissionsJob = fetchApi(
				localization,
				err => onError(err, true),
				axios => axios.get('staff/permissions'),
			);
			const none = async () => ({});
			const groupsJob = editGroupId
				? fetchApi(
						localization,
						err => onError(err, true),
						axios => axios.get(`staff/groups/${editGroupId}`),
				  )
				: none();
			const responses = await Promise.all([permissionsJob, groupsJob]);
			currentDefaultPage.value = responses[1].start_policy;
			startPolicy.value = currentDefaultPage.value;
			fetchedDefaultPages.value = JSON.parse(JSON.stringify(responses[0]));
			const grp = groupBy(responses[0], 'group_name');
			defaultPages.value = responses[1].permissions?.filter(group => group.policy.includes('view'));
			for (const group in grp) {
				groupChecked.push(false);
				for (const item of grp[group])
					if (itemChecked[group]) itemChecked[group].push(false);
					else itemChecked[group] = [false];
			}

			if (editGroupId) {
				const edit = responses[1];
				edit.permissions?.forEach(permission => {
					let foundIndex: number | undefined = undefined;
					let chekedCount = 0;
					for (let i = 0; i < grp[permission.group_name].length; i++) {
						if (grp[permission.group_name][i].policy === permission.policy) {
							foundIndex = i;
						}
						if (itemChecked[permission.group_name][i]) chekedCount++;
					}
					if (typeof foundIndex !== 'undefined') {
						itemChecked[permission.group_name][foundIndex] = true;
						chekedCount++;
					}
					let index = 0;
					for (const group in grp) {
						if (group == permission.group_name) groupChecked[index] = true;
						index++;
					}
				});
				inputGroupName.value = edit.name;
			}
			populatePermissions(grp);
			groups.value = grp;
			store.commit('setLoading', false);
		});
		onMounted(async () => {
			document.title += ' - ' + header.value;
		});
		const header = computed(() =>
			typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('edit')
				? localization.t('text.header_edit')
				: localization.t('text.header'),
		);
		return {
			startPolicyError,
			startPolicy,
			addDefaultPage,
			currentDefaultPage,
			defaultPages,
			inputGroupName,
			groups,
			groupChecked,
			itemChecked,
			disabled,
			isEditMode,
			errMsg,
			notAllowEditGroup,
			clsErr: computed(() => (errMsg.value !== '&nbsp;' ? 'input--error' : '')),
			header,
			markGroup: async (checked, value) => {
				await sleep(1);
				for (let i = 0; i < itemChecked[value].length; i++) {
					itemChecked[value][i] = checked;
				}

				populatePermissions(groups.value);
			},
			markItem: async (groupName, checked, itemPolicy, index, group) => {
				const itemPolicyWords = itemPolicy.split('.');
				const itemPolicyWord = itemPolicyWords[itemPolicyWords.length - 2];
				await sleep(1);
				let filled = false;
				for (let i = 0; i < itemChecked[groupName].length; i++) {
					if (itemChecked[groupName][i]) {
						filled = true;
					}
					const policyWordsArray = group[i].policy.split('.');
					const isView = itemPolicyWords[itemPolicyWords.length - 1] === 'view';
					const isManagement = itemPolicyWords[itemPolicyWords.length - 1] === 'management';
					const policyName = policyWordsArray[policyWordsArray.length - 2];
					if (itemPolicyWord === policyName && isManagement && checked) {
						itemChecked[groupName][i] = true;
						filled = true;
					}
					if (isView && !checked) {
						itemChecked[groupName][0] = false;
						itemChecked[groupName][1] = false;
						filled = false;
					}
				}

				if (filled) groupChecked[index] = true;
				else groupChecked[index] = false;

				populatePermissions(groups.value);
			},
			addGroup: async () => {
				const validator = createValidator();
				lastError?.destroy();
				errMsg.value = '&nbsp;';
				disabled.value = true;
				if (validator?.fails()) {
					if (validator?.errors?.errors?.name || validator?.errors?.errors?.permissions) {
						onNameError(validator?.errors?.errors?.name || validator?.errors?.errors?.permissions);
					}
					if (validator?.errors?.errors?.start_policy) {
						onStartPolicyError(validator?.errors?.errors?.start_policy[0]);
					}
					return;
				}

				store.commit('setLoading', true);
				const response = await fetchApi(
					localization,
					(err, code, type) => {
						if (!type) onError(err, false);
						else if (type === 'name') onNameError(err);
					},
					axios =>
						editGroupId
							? axios.put(`staff/groups/${editGroupId}`, {
									name: inputGroupName.value.trim(),
									permissions: selectedPermissions,
									start_policy: startPolicy.value,
							  })
							: axios.post('staff/groups', {
									name: inputGroupName.value.trim(),
									permissions: selectedPermissions,
									start_policy: startPolicy.value,
							  }),
					['name', 'permissions', 'start_policy'],
				);

				if (response.message === 'success') {
					toaster.success(toast, localization.t('text.generalSuccessUpdated'));
					window.location.href = '/dashboard/staff-groups';
				}
			},
		};
	},
};
</script>
