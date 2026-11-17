import { ActionContext, createStore } from 'vuex';
import retrieveCountryId from '../middleware/location';
import getCookie from '../middleware/getCookie';
import '../extensions/Array';
import fetchApi from '../network/fetchEndpoint';
import getValidation from './validation/getValidation';
import loadValidationAndPermissions from './validation/loadValidationAndPermissions';
import productsService from '../services/productsService';
import citiesService from '../services/citiesService';
import deliveryCitiesService from '../services/deliveryCitiesService';
import countriesService from '../services/countriesService';
import brandsService from '../services/brandsService';
import productTypesService from '../services/productTypesService';
import catalogFeaturesService from '../services/catalogFeaturesService';
import catalogFiltersService from '../services/catalogFiltersService';
import materialsService from '../services/materialsService';

let localization: any;

export interface MainState {
	currentClientCountryId: string
	currentClientLanguage: string
	loaded: boolean
	ready: boolean
	isPictureError: boolean
	currentValidation?: {
		[property: string]: any
	}
	permissions?: Array<{ [property: string]: any }>
	errMsg?: string
	errCode?: number
	userProfile: any
	profile: Array<{
		id: number
		name: string
		children?: Array<{
			id: number
			name: string
			code: string
			order: number
			image_src: string
			href?: string
			items: Array<{
				name: string
				section_code: string
				href: string
				order: number
			}>
		}>
		code: string
		order: number
		href: string
		image_src?: string
		symbol?: string
		items: Array<any>
	}>
	mainMenu: Array<{
		id: number
		name: string
		children?: Array<{
			id: number
			name: string
			code: string
			order: number
			image_src: string
			href?: string
			items: Array<{
				name: string
				section_code: string
				href: string
				order: number
			}>
		}>
		code: string
		order: number
		href: string
		image_src?: string
		symbol?: string
		items: Array<any>
	}>

	[module: string]: any
}

function getMenuOrBar(key: string) {
	const menuOrBar = localStorage.getItem(key);
	if (menuOrBar && menuOrBar !== 'undefined') return JSON.parse(menuOrBar);
	return undefined;
}

async function populateMenuAndBar(context: ActionContext<MainState, MainState>) {
	const mainMenu = getMenuOrBar('main_menu');
	if (mainMenu) context.commit('setMainMenu', mainMenu);
	const menus = await fetchApi(
		localization,
		(err, code) => context.commit('setErrorMessage', {
			errMsg: err,
			errCode: code,
		}),
		axios => axios.get('dashboard-menu/all'),
	);
	if (Array.isArray(menus)) {
		localStorage.setItem('main_menu', JSON.stringify(menus));
		context.commit('setMainMenu', menus);
	}
}

function getPermissions() {
	const permissions = localStorage.getItem('user_permissions');
	if (permissions) return JSON.parse(permissions);
	return undefined;
}

async function populateValidation(context: ActionContext<MainState, MainState>, path: string, key: string) {
	const validation = await fetchApi(
		localization,
		(err, code) => context.commit('setErrorMessage', {
			errMsg: err,
			errCode: code,
		}),
		axios => axios.get(path),
	);
	if (Object.keys(validation).length > 0) {
		// Удаляем правило валидации для created_at для продуктов
		if (key === 'catalog_product_validation' && validation.rules && validation.rules.created_at) {
			delete validation.rules.created_at;
		}
		localStorage.setItem(key, JSON.stringify(validation));
		context.commit('setCurrentValidation', validation);
		context.commit('setReady');
	}
}

async function retrievePermissions(context: ActionContext<MainState, MainState>) {
	if (!getCookie(document, 'session_id')) return;
	const profile = await fetchApi(localization, (err, code) => context.commit('setErrorMessage', {
		errMsg: err,
		errCode: code,
	}), axios => axios.get('staff/profile'));
	context.commit('setProfile', profile);

	if (Object.keys(profile).length > 0 && Array.isArray(profile.permissions)) {
		localStorage.setItem('user_permissions', JSON.stringify(profile.permissions));
		context.commit('setPermissions', profile.permissions);
	} else {
		context.commit('setProfile', { first_name: 'q' });
	}
}

async function setProfile(context: ActionContext<MainState, MainState>) {
	const profile = await fetchApi(localization, (err, code) => context.commit('setErrorMessage', {
		errMsg: err,
		errCode: code,
	}), axios => axios.get('staff/profile'));
	context.commit('setProfile', profile);
}

export default (mdls: object) => createStore<MainState>({
	modules: {
		...mdls,
	},
	state() {
		return {
			isPictureError: false,
			currentClientCountryId: '',
			currentClientLanguage: '',
			loaded: false,
			ready: false,
			mainMenu: [],
			profile: [],
			userProfile: {},
			productSearch: [],
			productSearchTotal: [],
			searchQuery: '',
			citySearch: [],
			citySearchTotal: 0,
			countrySearch: [],
			activeProductId: 0,
			brandSearch: [],
			productTypeSearch: [],
			catalogFeaturesSearch: [],
			catalogFiltersSearch: [],
			materialsSearch: [],
		};
	},
	/* eslint-disable */
	mutations: {
		setPictureError(state, isPictureError) {
			state.isPictureError = isPictureError;
		},
		setProfile(state, profile) {
			state.userProfile = profile;
		},
		setClientLanguage(state, language: string) {
			state.currentClientLanguage = language;
		},
		setClientCountryId(state, countryId: string) {
			state.currentClientCountryId = countryId;
		},
		setPhoneMask(state, mask) {
			if (state.currentValidation.masks && state.currentValidation.masks.phone) {
				state.currentValidation.masks.phone = mask;
			}

		},
		setCurrentValidation(state, validation: { [property: string]: any }) {
			state.errMsg = undefined;
			state.currentValidation = validation;
			state.loaded = true;
		},
		setPermissions(state, permissions: Array<{ [property: string]: any }>) {
			state.permissions = permissions;
		},
		setErrorMessage(state, err: { errMsg?: string, errCode?: number }) {
			state.errMsg = err.errMsg;
			state.errCode = err.errCode;
		},
		setLoading(state, loading: boolean) {
			state.loaded = !loading;
		},
		setMainMenu(state, menu: Array<any>) {
			menu.sortAscendantByField('order');
			menu.forEach(item => {
				item.children?.sortAscendantByField('order');
				item.children?.forEach(subItem => subItem.children?.sortAscendantByField('order'));
			});
			state.mainMenu = menu;
		},
		setReady(state) {
			state.ready = true;
		},
	},
	/* eslint-enable */
	actions: {
		async setProfileAction(context) {
			await setProfile(context);
		},

		async setActiveProductId(context, productId) {
			context.state.activeProductId = productId;
		},
		
		async searchProducts(context, search: string) {
			context.state.searchQuery = search;
			
			context.state.productSearch = await productsService.getAllWithPagination(
				localization,
				1,
				100,
				0,
				"search=" + search,
				{}
			);
			context.state.productSearchTotal = await productsService.total(localization, 0, "search=" + search, {});
		},

		async searchProductsItem(context, search: string) {
			let productSearch = await productsService.getAllWithPagination(
				localization,
				1,
				100,
				0,
				"search=" + search,
				{}
			);

			if (productSearch.length == 1) {
				let hash = window.location.hash;
				location.href = "/dashboard/products/item?edit=" + productSearch[0]['id'] + hash;
			} else {
				location.href = "/dashboard/products?s=" + search;
			}
		},

		async searchCities(context, search: string) {
			context.state.searchQuery = decodeURIComponent(search);

			if (context.state.searchQuery.length >= 2) {
				let cities = await citiesService.getAll(localization, errMsg => toaster.error(toast, errMsg), context.state.searchQuery);
	
				context.state.citySearchTotal = cities.length;
				context.state.citySearch = cities;
			}
		},

		async searchDeliveryCities(context, search: string) {
			context.state.searchQuery = decodeURIComponent(search);

			if (context.state.searchQuery.length >= 2) {
				let cities = await deliveryCitiesService.getAll(localization, errMsg => toaster.error(toast, errMsg), context.state.searchQuery);
	
				context.state.citySearchTotal = cities.length;
				context.state.citySearch = cities;
			}
		},

		async searchCountries(context, search: string) {
			context.state.searchQuery = decodeURIComponent(search);

			if (context.state.searchQuery.length >= 2) {
				let countries = await countriesService.getAll(localization, errMsg => toaster.error(toast, errMsg), context.state.searchQuery);
	
				context.state.countrySearch = countries;
			}
		},


		async searchBrands(context, search: string) {
			context.state.searchQuery = decodeURIComponent(search);

			if (context.state.searchQuery.length >= 2) {
				let brands = await brandsService.getAll(localization, errMsg => toaster.error(toast, errMsg), context.state.searchQuery);
	
				context.state.brandSearch = brands;
			}
		},

		async searchProductTypes(context, search: string) {
			context.state.searchQuery = decodeURIComponent(search);

			if (context.state.searchQuery.length >= 2) {
				let productTypes = await productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg), context.state.searchQuery);
	
				context.state.productTypeSearch = productTypes;
			}
		},

		async searchCatalogFeatures(context, search: string) {
			context.state.searchQuery = decodeURIComponent(search);

			if (context.state.searchQuery.length >= 2) {
				let features = await catalogFeaturesService.getAll(localization, errMsg => toaster.error(toast, errMsg), context.state.searchQuery);
	
				context.state.catalogFeaturesSearch = features;
			}
		},

		async searchCatalogFilters(context, search: string) {
			context.state.searchQuery = decodeURIComponent(search);

			if (context.state.searchQuery.length >= 2) {
				let filters = await catalogFiltersService.getAll(localization, errMsg => toaster.error(toast, errMsg), context.state.searchQuery);
	
				context.state.catalogFiltersSearch = filters;
			}
		},

		async searchMaterials(context, search: string) {
			context.state.searchQuery = decodeURIComponent(search);

			if (context.state.searchQuery.length >= 2) {
				let materials = await materialsService.getAll(localization, errMsg => toaster.error(toast, errMsg), context.state.searchQuery);
	
				context.state.materialsSearch = materials;
			}
		},

		async initStore(context, payload: { pageId: string, localization: any }) {
			localization = payload.localization;
			const countryIdRes = await retrieveCountryId(document);
			const menuAndBarRes = await populateMenuAndBar(context);
			let countryId;
			let menuEndBar;
			Promise.all([countryIdRes, menuAndBarRes]).then((values) => {
				[countryId, menuEndBar] = [...values];
				const validation = getValidation(payload.pageId);
				const language = getCookie(document, 'client_language');
				const permissions = getPermissions();
				if (getCookie(document, 'session_id')) menuEndBar;
				if (!language) document.cookie = 'client_language=ru; SameSite=Strict; max-age=86400; secure; path=/';
				context.commit('setClientCountryId', countryId);
				context.commit('setClientLanguage', language || 'ru');
				if (validation && permissions) {
					context.commit('setPermissions', permissions);
					context.commit('setCurrentValidation', validation);
					context.commit('setReady');
				}
			});
		},

		switchLanguage(context, language: string) {
			document.cookie = `client_language=${language}; SameSite=Strict; max-age=86400; secure; path=/`;
			context.commit('setClientLanguage', language);
			// window.location.reload()
		},
		async loadValidationAndPermissions(context, pageId: string) {
			await loadValidationAndPermissions(context, pageId, retrievePermissions, populateValidation);
		},
	},
});
