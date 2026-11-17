<template v-show="store.state.ready">
	<div class="container__wrapper">
		<!-- Header -->
		<Transition>
			<header class="header" id="header" v-if="authorized">
				<a href="/" class="logotype">
					<img src="../../assets/img/logo.svg" />
				</a>
				<div v-if="authorized && (['/dashboard/materials','/dashboard/features','/dashboard/products/item','/dashboard/catalog-filters','/dashboard/product-types','/dashboard/brands','/dashboard/cities', '/dashboard/products', '/dashboard/delivery-cities', '/dashboard/countries'].includes(getUrlWithoutParams(window.location.pathname)))" class="input-group">
					<form action="">
						<input type="text" v-model="searchRequest" class="input-group__input" :placeholder="$t(mapPlaceholders.get(window.location.pathname))" />
						<button class="input-group__btn" @click.prevent="search" :title="$t('text.search_action')">
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M11 5.5C11 6.78756 10.5576 7.97179 9.81643 8.90894C10.101 8.88377 10.3943 8.9801 10.6122 9.19792L13.1213 11.7071C13.5119 12.0976 13.5119 12.7308 13.1213 13.1213C12.7308 13.5118 12.0976 13.5118 11.7071 13.1213L9.19795 10.6121C8.98013 10.3943 8.8838 10.101 8.90897 9.81641C7.97181 10.5576 6.78758 11 5.5 11C2.46243 11 0 8.53757 0 5.5C0 2.46243 2.46243 0 5.5 0C8.53757 0 11 2.46243 11 5.5ZM5.5 9C7.433 9 9 7.433 9 5.5C9 3.567 7.433 2 5.5 2C3.567 2 2 3.567 2 5.5C2 7.433 3.567 9 5.5 9Z"
									fill="#797E82" />
							</svg>
						</button>
					</form>
				</div>
				<MainBar :onItemMenuClick="onItemMenuClick" :show="authorized" :items="barItems" />
			</header>
		</Transition>

		<!-- End of header -->

		<!-- Content -->

		<Transition>
			<div v-if="menuItems.length || showLogin" class="content">
				<SideMenu :show="authorized" v-if="!showLogin" :menu="menuItems" />
				<!-- <SideMenu v-if="authorized && menuItems.length > 0" :menu="menuItems" /> -->

				<slot />
			</div>
		</Transition>

		<!-- End of content -->
	</div>
	<!-- Footer -->
	<Transition>
		<footer class="footer" :class="footerCls" id="footer" v-if="authorized">
			<FooterBreadcrumb :show="true" :navigationTree="navigationTree" />
			<span class="footer__copyright">Aizberg v.{{ version }}</span>
		</footer>
	</Transition>
	<!-- End of footer -->
	<Transition>
		<Loader :show="loading" />
	</Transition>
</template>

<script lang="ts">
import { useStore } from 'vuex';
import { computed, inject, onMounted, onBeforeMount, ref, watch, getCurrentInstance } from 'vue';

import { useI18n } from 'vue-i18n';
import { MainState } from '../../store/mainStore';
import Loader from '../_components/FullScreenLoader.vue';
import MainBar from '../_components/MainBar.vue';
import SideMenu from '../_components/SideMenu.vue';
import FooterBreadcrumb from '../_components/FooterBreadcrumb.vue';
import pkg from '../../package.json';
import fetchApi from '../../network/fetchEndpoint';
import navigationTree from '../_navigationTree';
	
export default {
	components: {
		Loader,
		MainBar,
		SideMenu,
		FooterBreadcrumb,
	},

	setup() {
		const store = useStore<MainState>();
		const internalInstance = getCurrentInstance();
		const localization = useI18n();
		const authorized = ref(false);
		const getPageId = () => internalInstance?.appContext.config.globalProperties.$pageId;
		const authenticated = () => internalInstance?.appContext.config.globalProperties.$authenticated;
		const toast = inject('toast') as any;
		const menuItems = ref([]);

		const searchRequest = ref();

		const mapPlaceholders = new Map();
		mapPlaceholders.set('/dashboard/cities', 'text.search_placeholder_cities');
		mapPlaceholders.set('/dashboard/products', 'text.search_placeholder');
		mapPlaceholders.set('/dashboard/delivery-cities', 'text.search_placeholder_cities');
		mapPlaceholders.set('/dashboard/countries', 'text.search_placeholder_countries');
		mapPlaceholders.set('/dashboard/product-types', 'text.search_placeholder_groups');
		mapPlaceholders.set('/dashboard/brands', 'text.search_placeholder_brands');
		mapPlaceholders.set('/dashboard/catalog-filters', 'text.search_placeholder_filters');
		mapPlaceholders.set('/dashboard/features', 'text.search_placeholder_features');
		mapPlaceholders.set('/dashboard/materials', 'text.search_placeholder_materials');
		mapPlaceholders.set('/dashboard/products/item', 'text.search_placeholder');

		const getUrlWithoutParams = (urlString) => {
			let urlWithoutParams = urlString.split("?").shift();
			console.log('url = ' + urlWithoutParams);
			return urlWithoutParams;
		}
		
		const search = async () => {
			console.log('product path = ' + window.location.pathname);
			
			if (window.location.pathname === '/dashboard/products') {
				await store.dispatch('searchProducts', encodeURIComponent(searchRequest.value));
			}

			if (window.location.pathname === '/dashboard/products/item') {
				await store.dispatch('searchProductsItem', encodeURIComponent(searchRequest.value));
			}

			if (window.location.pathname === '/dashboard/cities') {
				await store.dispatch('searchCities', encodeURIComponent(searchRequest.value));
			}

			if (window.location.pathname === '/dashboard/delivery-cities') {
				await store.dispatch('searchDeliveryCities', encodeURIComponent(searchRequest.value));
			}

			if (window.location.pathname === '/dashboard/countries') {
				await store.dispatch('searchCountries', encodeURIComponent(searchRequest.value));
			}

			if (window.location.pathname === '/dashboard/product-types') {
				await store.dispatch('searchProductTypes', encodeURIComponent(searchRequest.value));
			}

			if (window.location.pathname === '/dashboard/brands') {
				await store.dispatch('searchBrands', encodeURIComponent(searchRequest.value));
			}

			if (window.location.pathname === '/dashboard/features') {
				await store.dispatch('searchCatalogFeatures', encodeURIComponent(searchRequest.value));
			}

			if (window.location.pathname === '/dashboard/catalog-filters') {
				await store.dispatch('searchCatalogFilters', encodeURIComponent(searchRequest.value));
			}

			if (window.location.pathname === '/dashboard/materials') {
				await store.dispatch('searchMaterials', encodeURIComponent(searchRequest.value));
			}
		};

		watch(
			() => store.state.currentClientLanguage,
			() => {
				if (store.state.currentClientLanguage && store.state.currentClientLanguage !== localization.locale.value) {
					store.dispatch('loadValidationAndPermissions', getPageId());
					localization.locale.value = store.state.currentClientLanguage;
				}
			},
		);
		watch(
			() => store.state.errMsg,
			() => {
				toast.error(store.state.errMsg, {
					duration: false,
					dismissible: true,
					position: 'bottom',
				});
			},
		);
		const showLogin = ref(false);
		onBeforeMount(async () => {
			const pi = getPageId();
			// console.log(window.document.referrer);
			if (
				pi !== '/pages/staff/login/index' &&
				pi !== '/pages/staff/password-recovery/first-step' &&
				pi !== '/pages/staff/password-recovery/second-step' &&
				pi !== '/pages/staff/password-recovery/third-step'
			) {
				await store.dispatch('setProfileAction');
			} else {
				showLogin.value = true;
			}
			if (authenticated()) {
				Promise.all([
					store.dispatch('initStore', {
						pageId: pi,
						localization,
					}),
					store.dispatch('loadValidationAndPermissions', pi),
				]);
				authorized.value = authenticated() || false;
				store.commit('setLoading', false);
				const vh = window.innerHeight * 0.01;
				document.documentElement.style.setProperty('--vh', `${vh}px`);
			}
			store.commit('setLoading', false);
		});
		return {
			showLogin,
			store,
			authorized,
			navigationTree,
			version: pkg.version,
			menuItems,
			loading: computed(() => !store.state.loaded),
			barItems: computed(() => store.state.mainMenu),
			footerCls: computed(() => (authorized.value ? '' : 'footer--end')),
			onItemMenuClick: item => {
				menuItems.value = item.children && item.children.length > 0 ? item.children : [];
			},
			logout: async () => {
				store.dispatch('setLoading', true);
				const response = await fetchApi(
					localization,
					err => {
						toast.error(err, {
							duration: false,
							dismissible: true,
							onClose: () => window.location.reload(),
							position: 'bottom',
						});
					},
					axios => axios.post('staff/logout'),
				);
				if (response.redirect_to) window.location.replace(response.data.redirect_to);
				store.dispatch('setLoading', false);
			},
			searchRequest,
			search,
			mapPlaceholders,
			getUrlWithoutParams,
		};
	},
};
</script>
<style scoped>
.v-enter-active,
.v-leave-active {
	transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}

.input-group .input-group__input::placeholder {
    color: #F31B46 !important;
}

/* Для Firefox */
.input-group .input-group__input::-moz-placeholder {
    color: #F31B46 !important;
}

/* Для Chrome/Safari/Opera */
.input-group .input-group__input::-webkit-input-placeholder {
    color: #F31B46 !important;
}

/* Для IE/Edge */
.input-group .input-group__input:-ms-input-placeholder {
    color: #F31B46 !important;
}
</style>
