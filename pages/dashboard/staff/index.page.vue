<template>
	<AppPage
		:button-text="$t('text.add_staff_button')"
		:title="$t('text.header')"
		:handler="() => (window.location.href = '/dashboard/staff/create')"
		:canEdit="canEdit">
		<div class="list list--four list--employees">
			<div class="list__topping">
				<span class="list__heading list__heading--plug"></span>
				<button class="list__heading list__heading--sort" @click="onSort" :title="$t('text.table_sort_action')">
					{{ $t('text.table_staff_name_header') }}
				</button>
				<span class="list__heading">{{ $t('text.table_staff_contacts') }}</span>
				<button class="list__heading list__heading--sort" @click="onSortByGroups" :title="$t('text.table_sort_action')">
					{{ $t('text.table_staff_group') }}
				</button>
				<span class="list__heading">{{ $t('text.table_staff_edit') }}</span>
			</div>
			<div class="list__item" v-for="staff in staffs.filter(item => item.is_blocked === 'N')">
				<span class="list__ava">
					<!--          TODO delete style width:39px-->
					<img style="width: 39px" :src="staff.userpic_name !== null ? imgPath + staff.userpic_name : defaultPic" alt="" />
				</span>
				<span class="list__elem">
					<span> {{ staff.fullName }}</span>
				</span>
				<span class="list__elem">
					<span>{{ phoneFormat(staff.phone) }}</span>
					<span>{{ staff.email }}</span>
				</span>
				<span class="list__elem" v-if="staff.groups">
					{{ staff.groups }}
				</span>
				<span v-else class="list__elem"> - </span>
				<span class="list__elem">
					<button
						:disabled="!canEdit"
						class="list__edit"
						:title="$t('text.edit_group_action')"
						@click="window.location.href = `/dashboard/staff/edit/${staff.id}`"></button>
				</span>
			</div>
		</div>
		<template v-if="blockedStaffs">
			<div class="main__content">
				<h2 class="main__title">{{ $t('text.table_blocked_staff_title') }}</h2>
			</div>
			<div class="list list--four list--employees list--opacity">
				<div class="list__item" v-for="staff in staffs.filter(item => item.is_blocked === 'Y')">
					<span class="list__ava">
						<!--                              TODO delete style width:39px-->
						<img style="width: 39px" :src="staff.userpic_name !== null ? imgPath + staff.userpic_name : defaultPic" alt="" />
					</span>
					<span class="list__elem">
						<span> {{ staff.fullName }}</span>
					</span>
					<span class="list__elem">
						<span>{{ phoneFormat(staff.phone) }}</span>
						<span>{{ staff.email }}</span>
					</span>
					<span class="list__elem" v-if="staff.groups">
						{{ staff.groups }}
					</span>

					<span v-else class="list__elem"> - </span>

					<span class="list__elem">
						<button
							:disabled="!canEdit"
							class="list__edit"
							:title="$t('text.edit_group_action')"
							@click="() => (window.location.href = `/dashboard/staff/edit/${staff.id}`)"></button>
					</span>
				</div>
			</div>
		</template>
	</AppPage>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import staffService from '../../../services/staffService';
import '../../../extensions/Array';
import { DEFAULT_PIC, IMG_PATH } from '../../../utils/constants';
import viewPermissions from '../../../utils/viewPermissions';
import sort from '../../../utils/onSort';
import phoneFormat from '../../../utils/phoneFormat';
import toaster from '../../../utils/toaster';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
export default {
	setup() {
		const defaultPic = DEFAULT_PIC;
		const imgPath = IMG_PATH;
		const toast = inject('toast') as any;
		const localization: any = useI18n();
		const store = useStore<MainState>();
		const staffs = ref([]);

		const blockedStaffs = ref(false);
		const blockedStaffHandler = () => {
			staffs.value.forEach(item => {
				if ((item.is_blocked as any) === 'Y') {
					blockedStaffs.value = true;
				}
			});
		};

		const addFullName = employees => {
			if (Array.isArray(employees)) {
				employees.forEach(item => {
					item.fullName = `${item.last_name} ${item.first_name}`;
				});
			}
		};

		const { canEdit, canView } = usePageInit('staff');

		const onSort = () => sort(true, staffs?.value, 'current_staff_sort', 'fullName');
		const onSortByGroups = () => sort(true, staffs?.value, 'current_staff_sort', 'groups');
		watch(
			async () => store.state.ready,
			async () => {
				canEdit.value = viewPermissions.canEdit(store.state.permissions, 'staff.management');
			},
		);
		onBeforeMount(async () => {
			if (!canView.value) redirect('/dashboard');
			await sleep(1);
			store.commit('setLoading', true);
			const staffsArray = await staffService.getStaffs(localization, errMsg => toaster.error(toast, errMsg));
			store.commit('setLoading', false);
			staffs.value = staffsArray.map(item => ({
				email: item.email,
				first_name: item.first_name,
				fullName: item.fullName,
				groups: item.groups.map(group => group.name).shift(),
				id: item.id,
				is_blocked: item.is_blocked,
				last_name: item.last_name,
				phone: item.phone,
				userpic_name: item.userpic_name,
				max: item.max || '',
				whatsapp: item.whatsapp || '',
				telegram: item.telegram || '',
			}));

			addFullName(staffs.value);
			blockedStaffHandler();
		});
		onMounted(() => {
			document.title += ` - ${localization.t('text.title')}`;
		});

		return {
			canView,
			phoneFormat,
			staffs,
			blockedStaffs,
			onSort,
			canEdit,
			defaultPic,
			imgPath,
			onSortByGroups,
		};
	},
};
</script>
