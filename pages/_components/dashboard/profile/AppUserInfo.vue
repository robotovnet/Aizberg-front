<template>
	<div class="user-info__overlay"
	     :class="overlayCls"
	     @click.self="onClose"></div>
	<div class="user-info"
	     :class="activeCls">
		<div class="user-info__top">
			<div class="user-info__ava">
				<img :src="user?.userpic_name ? imgPath + user?.userpic_name : defaultImg"
				     alt="">
			</div>
			<div class="user-info__about">
				<span class="user-info__name">{{ user?.full_name }}</span>
				<span class="user-info__position">{{ user?.groups[0]?.name }}</span>
			</div>
		</div>
		<div class="user-info__contacts">

			<span>{{ userPhone }}</span>
			<span>{{ user?.email }}</span>
		</div>
		<button class="btn"
		        @click="window.location.replace('/dashboard/profile')">
			{{ $t('text.user_info_change_data_button') }}
		</button>
		<div class="user-info__bottom">
			<button class="btn"
			        @click="window.location.replace('/staff/logout')">{{ $t('text.user_info_logout_button') }}
			</button>
		</div>

	</div>
</template>

<script lang="ts">
import { onMounted } from '@vue/runtime-core';
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import { DEFAULT_PIC, IMG_PATH } from '../../../../utils/constants';
import { MainState } from '../../../../store/mainStore';
import phoneFormat from '../../../../utils/phoneFormat';

export default {
	props: {
		show: {
			type: Boolean,
			default: false,
			required: true,
		},

	},

	emits: ['profileClose'],

	setup(props, { emit }) {
		const activeCls = ref('');
		const overlayCls = ref('');
		const imgPath = ref(IMG_PATH);
		const defaultImg = ref(DEFAULT_PIC);
		const store = useStore<MainState>();
		const user = <any>ref(null);

		const toggleDialog = (show?: boolean) => {
			if (show) {
				activeCls.value = 'modal--active';
				overlayCls.value = 'user-info__overlay--active';
			} else {
				activeCls.value = '';
				overlayCls.value = '';
			}
		};
		const userPhone = ref('');
		watch(() => props.show, async () => {
			user.value = store.state.userProfile as any;
			userPhone.value = phoneFormat(user.value.phone);
			toggleDialog(props.show);
		});

		onMounted(() => {
			toggleDialog(props.show);
		});

		return {
			userPhone,
			user,
			imgPath,
			defaultImg,
			activeCls,
			overlayCls,
			onClose: () => {
				toggleDialog(false);
				emit('profileClose');
			},
		};
	},
};
</script>
