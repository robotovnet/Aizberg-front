import sleep from '../../utils/sleep';

export default async (context, pageId: string, retrievePermissions, populateValidation) => {
	const none = async () => {
	};
	let job: Promise<any> = none();
	switch (pageId) {
		case '/pages/staff/login/index':
			job = populateValidation(context, 'form-validation/client/login', 'login_validation');
			break;
		case '/pages/staff/password-recovery/first-step':
			job = populateValidation(
				context,
				'form-validation/client/passwordRestoreFirstStep',
				'recover_send_code_validation',
			);
			break;
		case '/pages/staff/password-recovery/second-step':
			job = populateValidation(
				context,
				'form-validation/client/passwordRestoreSecondStep',
				'recover_confirm_code_validation',
			);
			break;
		case '/pages/staff/password-recovery/third-step':
			job = populateValidation(
				context,
				'form-validation/client/passwordRestoreThirdStep',
				'recover_change_password_validation',
			);
			break;
		case '/pages/dashboard/staff-groups/item':
			job = populateValidation(
				context,
				'form-validation/staff/createOrUpdateGroup',
				'new_staff_group_validation',
			);
			break;
		case '/pages/dashboard/staff/create':
			job = populateValidation(
				context,
				'form-validation/staff/createStaff',
				'new_staff_validation',
			);
			break;
		case '/pages/dashboard/staff/edit/id':
			job = populateValidation(
				context,
				'form-validation/staff/staffProfile',
				'edit_staff_validation',
			);
			break;
		case '/pages/dashboard/profile/index':
			job = populateValidation(
				context,
				'form-validation/staff/profile',
				'staff_profile_validation',
			);
			break;

		case '/pages/dashboard/price-types/item':
			job = populateValidation(
				context,
				'form-validation/priceType/createOrUpdatePriceType',
				'price_type_validation',
			);
			break;
		case '/pages/dashboard/client-types/item':
			job = populateValidation(
				context,
				'form-validation/clientType/createOrUpdateClientType',
				'client_type_validation',
			);
			break;
		case '/pages/dashboard/countries/item':
			job = populateValidation(
				context,
				'form-validation/country/createOrUpdateCountry',
				'country_validation',
			);
			break;
		case '/pages/dashboard/cities/item':
			job = populateValidation(
				context,
				'form-validation/city/createOrUpdateCity',
				'city_validation',
			);
			break;
		case '/pages/dashboard/currencies/item':
			job = populateValidation(
				context,
				'form-validation/currency/createOrUpdateCurrency',
				'currencies_validation',
			);
			break;
		case '/pages/dashboard/shops/item':
			job = populateValidation(
				context,
				'form-validation/shop/createOrUpdateShop',
				'shops_validation',
			);
			break;
		case '/pages/dashboard/transport-companies/create':
			job = populateValidation(
				context,
				'form-validation/transportCompany/createOrUpdateTransportCompany',
				'transport_company_validation',
			);
			break;
		case '/pages/dashboard/transport-companies/edit/id':
			job = populateValidation(
				context,
				'form-validation/transportCompany/createOrUpdateTransportCompany',
				'transport_company_validation',
			);
			break;
		case '/pages/dashboard/pickup-points/item':
			job = populateValidation(
				context,
				'form-validation/transportCompany/createOrUpdatePickupPoint',
				'pickup_points_company_validation',
			);
			break;
		case '/pages/dashboard/service-centers/item':
			job = populateValidation(
				context,
				'form-validation/serviceCenter/createOrUpdateServiceCenter',
				'service_centers_validation',
			);
			break;	
		case '/pages/dashboard/delivery-cities/item':
			job = populateValidation(
				context,
				'form-validation/transportCompany/createOrUpdateCourierCity',
				'delivery_cities_validation',
			);
			break;
		case '/pages/dashboard/postamats/item':
			job = populateValidation(
				context,
				'form-validation/transportCompany/createOrUpdatePostamat',
				'postamats_validation',
			);
			break;
		case '/pages/dashboard/warehouses/item':
			job = populateValidation(
				context,
				'form-validation/transportCompany/createOrUpdateWarehouse',
				'warehouses_validation',
			);
			break;
		case '/pages/dashboard/product-types/item':
			job = populateValidation(
				context,
				'form-validation/catalog/createOrUpdateGroup',
				'product_types_validation',
			);
			break;
		case '/pages/dashboard/catalog-sections/item':
			job = populateValidation(
				context,
				'form-validation/catalog/createOrUpdateSection',
				'catalog_sections_validation',
			);
			break;
		case '/pages/dashboard/features/item':
			job = populateValidation(
				context,
				'form-validation/catalog/createOrUpdateFeature',
				'catalog_features_validation',
			);
			break;
		case '/pages/dashboard/catalog-filters/create':
			job = populateValidation(
				context,
				'form-validation/catalog/createFilter',
				'catalog_filters_validation',
			);
			break;
		case '/pages/dashboard/catalog-filters/edit':
			job = populateValidation(
				context,
				'form-validation/catalog/createFilter',
				'catalog_filters_validation',
			);
			break;
		case '/pages/dashboard/products/item':
			job = populateValidation(
				context,
				'form-validation/catalog/createOrUpdateProduct',
				'catalog_product_validation',
			);
			break;
		case '/pages/dashboard/sections-one-click-order/index':
			job = populateValidation(
				context,
				'form-validation/orderOneClick/SetSubscribers',
				'orderOneClickSetSubscribers',
			);
			break;
		case '/pages/dashboard/brands/item':
			job = populateValidation(
				context,
				'form-validation/catalog/createOrUpdateBrand',
				'createOrUpdateBrand',
			);
			break;
		case '/pages/dashboard/materials/item':
			job = populateValidation(
				context,
				'form-validation/material/CreateOrUpdateMaterial',
				'createOrUpdateMaterial',
			);
			break;
		case '/pages/dashboard/catalog-images/item':
			job = populateValidation(
				context,
				'form-validation/imageUploader/CreateOrUpdateImageUpload',
				'CreateOrUpdateImageUpload',
			);
			break;
		case '/pages/dashboard/payment-methods/item':
			job = populateValidation(
				context,
				'form-validation/transportCompany/createOrUpdatePaymentMethod',
				'createOrUpdatePaymentMethod',
			);
			break;
		case '/pages/dashboard/yml/index':
			job = populateValidation(
				context,
				'form-validation/ad/CreateOrUpdateYml',
				'CreateOrUpdateYml',
			);
			break;
		case '/pages/dashboard/bonus-program/item':
			job = populateValidation(
				context,
				'form-validation/bonusProgram/CreateOrUpdateBonusLevel',
				'createOrUpdateBonusLevel',
			);
			break;
		case '/pages/dashboard/clients/index':
			job = populateValidation(
				context,
				'form-validation/client/UpdateClientCard',
				'UpdateClientCard',
			);
			break;
		case '/pages/dashboard/sales/orders/item':
			job = populateValidation(
				context,
				'form-validation/order/ChangeTracknumber',
				'ChangeTracknumber',
			);
			break;
		case '/pages/dashboard/matrix-types/item':
			job = populateValidation(
				context,
				'form-validation/matrixType/createOrUpdateMatrixType',
				'matrix_type_validation',
			);
			break;
		case '/pages/dashboard/real-projects/item':
			job = populateValidation(
				context,
				'form-validation/realProjects/createOrUpdateRealProject',
				'real_project_validation',
			);
			break;
		default:
			await retrievePermissions(context);
			context.commit('setLoading', false);
			context.commit('setReady');
	}

	await sleep(1);
	if (!context.state.ready) await Promise.all([job, retrievePermissions(context)]);
};
