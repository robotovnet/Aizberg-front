<template>
	<div class="sidebar" :class="menuClsState">
		<!-- <div v-if="menu.length > 0 && show" class="sidebar" :class="menuClsState"> -->
		<ul class="sidebar__list">
			<li v-for="item in menu" :key="item.id" class="sidebar__item" :class="itemClsState(item.code)">
				<a
					v-on:click="select(item.code)"
					:href="item.href ? iten.href : 'javascript:void(0)'"
					class="sidebar__link"
					:title="item.name">
					<div v-html="item.image_inline" />
					<span>{{ item.name }}</span>
				</a>
				<div v-if="item.children && item.children.length > 0" class="dropdown">
					<ul class="dropdown__list">
						<li
							v-for="(subMenuItem, index) in item.children"
							:key="index"
							class="dropdown__item"
							:class="subItemClsState(subMenuItem.code)">
							<a :href="subMenuItem.href" class="dropdown__link">{{ subMenuItem.name }}</a>
						</li>
					</ul>
				</div>
			</li>
		</ul>
		<a v-on:click="toggle" class="sidebar__open" :class="switchClsState" :title="$t('text.unfold_link')"
			><span>{{ $t('text.fold_link') }}</span></a
		>
	</div>
</template>

<script lang="ts">
import { computed, onMounted } from '@vue/runtime-core';
import { Ref, ref, getCurrentInstance } from 'vue';
import populateMenu from './_populateMenu';

export default {
	props: {
		menu: {
			type: Array,
			required: true,
		},
		show: {
			type: Boolean,
			required: true,
		},
	},
	setup(props) {
		const switchClsState = ref('');
		const menuClsState = ref('');
		const selectedItem: Ref<string | undefined> = ref(undefined);
		let selectedSubItem: string | undefined;
		let anim = false;

		const internalInstance = getCurrentInstance();
		const authenticated = () => internalInstance?.appContext.config.globalProperties.$authenticated;

		onMounted(() => {
			if (authenticated()) {
				populateMenu();
				const toggle = localStorage.getItem('side_menu_state');
				const selected = localStorage.getItem('selected_side_menu_item');
				// eslint-disable-next-line camelcase
				const sub_selected = localStorage.getItem('selected_side_menu_sub_item');

				if (toggle === 'open') {
					menuClsState.value = 'sidebar--active';
					switchClsState.value = 'sidebar__open--close';
				}
				if (selected) selectedItem.value = selected;
				// eslint-disable-next-line camelcase
				if (sub_selected) selectedSubItem = sub_selected;
			}
		});

		return {
			switchClsState,
			menuClsState,
			menu: computed(() => props.menu),
			toggle: () => {
				menuClsState.value = menuClsState.value ? '' : 'sidebar--active';
				switchClsState.value = switchClsState.value ? '' : 'sidebar__open--close';
				localStorage.setItem('side_menu_state', menuClsState.value ? 'open' : 'close');
			},
			select: code => {
				anim = true;
				localStorage.setItem('selected_side_menu_item', code);
				selectedItem.value = code;
			},
			itemClsState: code => {
				if (code === selectedItem.value) {
					if (menuClsState.value) return anim ? 'sidebar__item--dropdown' : 'sidebar__item--dropdown-noanim';
					return 'sidebar__item--active';
				}
				return '';
			},
			subItemClsState: code => {
				if (selectedSubItem === code) return 'dropdown__item--active';
				return '';
			},
		};
	},
};
</script>
