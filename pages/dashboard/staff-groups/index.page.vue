<template>
	<AppPage
		:button-text="$t('text.add_group_button')"
		:title="$t('text.header')"
		:handler="() => (window.location.href = '/dashboard/staff-groups/item')"
		:can-edit="allowAddGroup">
		<div class="list list--three">
			<div class="list__topping">
				<button v-on:click="onSort" class="list__heading list__heading--sort" :title="$t('text.table_sort_action')">
					{{ $t('text.table_group_name_header') }}
				</button>
				<span class="list__heading">{{ $t('text.table_users_number_header') }}</span>
				<span class="list__heading">{{ $t('text.table_delete_header') }}</span>
			</div>
			<div v-for="group in groups" :key="group.id" class="list__item">
				<span class="list__elem">
					<button
						:disabled="!allowAddGroup"
						v-on:click="() => (window.location.href = `/dashboard/staff-groups/item?edit=${group.id}`)"
						class="list__edit"
						:title="$t('text.edit_group_action')"></button>
					<span>{{ group.name }}</span>
				</span>
				<span class="list__elem">{{ group.members_count }}</span>
				<span class="list__elem">
					<button
						:disabled="!allowAddGroup"
						v-on:click="onConfirmDelete(group.id, group.name)"
						class="cross"
						:title="$t('text.delete_group_action')"></button>
				</span>
			</div>
		</div>
		<AskDialog
			:deleteId="groupId?.toString()"
			:title="$t('text.dialog_delete_title')"
			:question="$t('text.dialog_delete_question') + '&quot;' + groupName + '&quot;' + '?'"
			:onConfirm="onDelete" />
	</AppPage>
</template>

<script lang="ts">
import { onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { MainState } from '../../../store/mainStore';
import fetchApi from '../../../network/fetchEndpoint';
import AskDialog from '../../_components/AskDialog.vue';
import sleep from '../../../utils/sleep';
import '../../../extensions/Array';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import redirect from '../../../utils/redirect';
export default {
	components: {
		AskDialog,
	},
	setup() {
		const localization = useI18n();
		const store = useStore<MainState>();
		const toast = inject('toast') as any;
		const groups = ref([]);
		const groupId = ref(undefined);
		const groupName = ref('');
		const allowAddGroup = ref(false);

		const onSort = (reverse: boolean = true) => {
			if (!Array.isArray(groups.value)) {
				return;
			}
			const sort = localStorage.getItem('current_staff_groups_sort');
			switch (sort) {
				case 'ascending':
					if (reverse) {
						groups.value.sortDescendantByField('name');
					} else {
						groups.value.sortAscendantByField('name');
					}
					localStorage.setItem('current_staff_groups_sort', reverse ? 'descending' : 'ascending');
					break;
				default:
					if (reverse) {
						groups.value.sortAscendantByField('name');
					} else if (sort === 'descending') groups.value.sortDescendantByField('name');
					if (sort || reverse) {
						localStorage.setItem('current_staff_groups_sort', reverse ? 'ascending' : 'descending');
					}
			}
		};

		const verifyPermissions = () => {
			let allowViewGroups = false;
			store.state.userProfile.permissions?.forEach(permission => {
				if (permission.policy === 'staff.groups.management') {
					allowAddGroup.value = true;
				}
				if (permission.policy === 'staff.groups.view') {
					allowViewGroups = true;
				}
			});
			return true;
		};
		const { canEdit, canView } = usePageInit('staff.groups');
		onBeforeMount(async () => {
			verifyPermissions();
			if (!verifyPermissions()) {
				return;
			}
			await sleep(1);
			store.commit('setLoading', true);
			groups.value = await fetchApi(
				localization,
				err => {
					toast.error(err, {
						duration: false,
						dismissible: true,
						onClose: () => window.location.reload(),
						position: 'bottom',
					});
				},
				axios => axios.get('staff/groups'),
			);
			onSort(false);
			store.commit('setLoading', false);
		});

		onMounted(() => {
			verifyPermissions();
			document.title += ` - ${localization.t('text.header')}`;
		});

		return {
			showDialog: false,
			groups,
			groupId,
			groupName,
			allowAddGroup,
			onDelete: async id => {
				store.commit('setLoading', true);
				const response = await fetchApi(
					localization,
					err => toaster.error(toast, err),
					axios => axios.delete(`staff/groups/${id}`),
					['errors'],
				);
				if (response.message === 'success') {
					store.commit('setLoading', true);
					groups.value = await fetchApi(
						localization,
						err => {
							toast.error(err, {
								duration: false,
								dismissible: true,
								onClose: () => window.location.reload(),
								position: 'bottom',
							});
						},
						axios => axios.get('staff/groups'),
					);
					onSort(false);
				}
				store.commit('setLoading', false);
			},
			onConfirmDelete: async (id, name) => {
				groupName.value = name;
				groupId.value = undefined;
				await sleep(1);
				groupId.value = id;
			},
			onSort,
		};
	},
};
</script>
