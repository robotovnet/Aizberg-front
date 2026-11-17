export default (pageId: string) => {
	let json: string | null | Array<any> = '';
	switch (pageId) {
		case '/pages/staff/login/index':
			json = localStorage.getItem('login_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/staff/password-recovery/first-step':
			json = localStorage.getItem('recover_send_code_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/staff/password-recovery/second-step':
			json = localStorage.getItem('recover_confirm_code_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/staff/password-recovery/third-step':
			json = localStorage.getItem('recover_change_password_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/staff-groups/item':
			json = localStorage.getItem('new_staff_group_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/staff/create':
			json = localStorage.getItem('new_staff_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/staff/edit/id':
			json = localStorage.getItem('edit_staff_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/staff/index':
			json = localStorage.getItem('new_staff_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/profile/index':
			json = localStorage.getItem('staff_profile_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/price-types/item':
			json = localStorage.getItem('price_type_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/client-types/item':
			json = localStorage.getItem('client_type_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/countries/item':
			json = localStorage.getItem('country_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/cities/item':
			json = localStorage.getItem('city_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/currencies/item':
			json = localStorage.getItem('currencies_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/shops/item':
			json = localStorage.getItem('shops_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/transport-companies/create':
			json = localStorage.getItem('transport_company_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/transport-companies/edit/id':
			json = localStorage.getItem('transport_company_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/delivery-cities/item':
			json = localStorage.getItem('delivery_cities_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/pickup-points/item':
			json = localStorage.getItem('pickup_points_company_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/postamats/item':
			json = localStorage.getItem('postamats_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/warehouses/item':
			json = localStorage.getItem('warehouses_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/product-types/item':
			json = localStorage.getItem('product_types_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/catalog-sections/item':
			json = localStorage.getItem('catalog_sections_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/features/item':
			json = localStorage.getItem('catalog_features_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/catalog-filters/edit/id':
			json = localStorage.getItem('catalog_filters_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/catalog-filters/create':
			json = localStorage.getItem('catalog_filters_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/products/item':
			json = localStorage.getItem('catalog_product_validation');
			if (json) {
				const validation = JSON.parse(json);
				// Удаляем правило валидации для created_at для продуктов
				if (validation.rules && validation.rules.created_at) {
					delete validation.rules.created_at;
				}
				return validation;
			}
			break;
		case '/pages/dashboard/sections-one-click-order/index':
			json = localStorage.getItem('orderOneClickSetSubscribers');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/brands/item':
			json = localStorage.getItem('createOrUpdateBrand');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/materials/item':
			json = localStorage.getItem('createOrUpdateMaterial');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/catalog-images/item':
			json = localStorage.getItem('CreateOrUpdateImageUpload');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/payment-method/item':
			json = localStorage.getItem('createOrUpdatePaymentMethod');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/yml/index':
			json = localStorage.getItem('CreateOrUpdateYml');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/bonus-program/item':
			json = localStorage.getItem('createOrUpdateBonusLevel');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/clients/index':
			json = localStorage.getItem('UpdateClientCard');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/sales/orders/item':
			json = localStorage.getItem('ChangeTracknumber');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/matrix-types/item':
			json = localStorage.getItem('matrix_type_validation');
			if (json) return JSON.parse(json);
			break;
		case '/pages/dashboard/real-projects/item':
			json = localStorage.getItem('real_project_validation');
			if (json) return JSON.parse(json);
			break;
		default:
			return undefined;
	}
};
