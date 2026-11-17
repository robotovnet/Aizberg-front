<template>
  <nav v-if="items.length > 0 && show"
class="header-nav">
    <ul class="header-nav__list">
      <li v-for="item in itemsMap"
          :key="item.id"
          class="header-nav__item"
          :class="(item.active) ? 'header-nav__item--active' : ''">
        <a @click="() => onItemMenuClick(item)"
            v-if="item.code && item.code === '1_doc'"
            :href="item.href"
            :title="item.name"
            class="header-nav__link header-nav__link--help">?</a>

        <a @click="profile(item)"

            v-else-if="item.code && item.code === '1_profile'"
            class="header-nav__link header-nav__link--user"
            style="z-index: 99"
            :title="item.name">{{ firstLetter }}
        </a>
        <a @click="() => onItemMenuClick(item)"
            v-else
            :href="item.href"
            class="header-nav__link"
            :title="item.name">
          <div v-html="item.image_inline"/>
        </a>

      </li>
      <li v-if="showLanguageSwitcher" class="header-nav__item header-nav__item--language">
        <div class="header-nav__language">
          <a @click="changeLanguage('ru')" 
             class="header-nav__lang-link" 
             :class="{ 'header-nav__lang-link--active': currentLanguage === 'ru' }"
             title="Русский">RU</a>
          <span class="header-nav__lang-separator">/</span>
          <a @click="changeLanguage('en')" 
             class="header-nav__lang-link" 
             :class="{ 'header-nav__lang-link--active': currentLanguage === 'en' }"
             title="English">EN</a>
        </div>
      </li>
      <app-user-info @profileClose="profileClose"
          :show="showUserInfo"/>
    </ul>

  </nav>
</template>

<script lang="ts">
import {
	onMounted, ref, watch, getCurrentInstance, computed,
} from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import AppUserInfo from './dashboard/profile/AppUserInfo.vue';
import { MainState } from '../../store/mainStore';

export default {
	components: { AppUserInfo },
	props: {
		items: {
			type: Array,
			required: true,
		},
		show: {
			type: Boolean,
			required: true,
		},
		onItemMenuClick: {
			type: Function,
			required: true,
		},
	},
	setup(props) {
		const itemsMap = ref([]);
		const showUserInfo = ref(false);
		const store = useStore<MainState>();
		const firstLetter = ref('');
		const localization = useI18n();

		const internalInstance = getCurrentInstance();
		const authenticated = () => internalInstance?.appContext.config.globalProperties.$authenticated;
		
		const currentLanguage = computed(() => localization.locale.value);
		
		// Проверка переменной окружения для отображения блока переключения языка
		const showLanguageSwitcher = computed(() => {
			const envValue = import.meta.env.VITE_SHOW_LANGUAGE_SWITCHER;
			return envValue === 'true' || envValue === true;
		});

		watch(() => props.items, () => {
			const selected = localStorage.getItem('main_bar_state');
			let item: any;
			props.items.forEach(i => {
				if ((i as any).code === selected) {
					(i as any).active = true;
					item = i;
				} else {
					(i as any).active = false;
				}
			});
			itemsMap.value = props.items as any;
			if (item && store.state.userProfile) { props.onItemMenuClick(item); }
			if (authenticated()) {
				firstLetter.value = store.state.userProfile?.first_name.charAt(0).toUpperCase();
			}
		});

		const profile = (item) => {
			item.active = !item.active;
			showUserInfo.value = !showUserInfo.value;
		};

		const profileClose = () => {
			itemsMap.value.forEach(i => {
				if ((i as any).code === '1_profile' && (i as any).active === true) { profile(i); }
			});
		};

		const onItemMenuClick = item => {
			props.items.forEach(i => (i as any).active = false);
			item.active = true;
			if (item.code === '1_profile') {
				item.active = true;
			} else {
				localStorage.setItem('main_bar_state', item.code);
				props.onItemMenuClick(item);
			}
		};

		const changeLanguage = (lang: 'ru' | 'en') => {
			if (localization.locale.value !== lang) {
				store.dispatch('switchLanguage', lang);
				localization.locale.value = lang;
				// Принудительное обновление страницы после переключения языка
				window.location.reload();
			}
		};

		return {
			firstLetter,
			profile,
			profileClose,
			onItemMenuClick,
			itemsMap,
			showUserInfo,
			currentLanguage,
			changeLanguage,
			showLanguageSwitcher,
		};
	},
};
</script>
