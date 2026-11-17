import login from './login';
import sendCode from './sendCode';
import confirmCode from './confirmCode';
import setNewPassword from './setNewPassword';
import newStaffGroup from './staffGroup';
import staffGroups from './staffGroups';
import profile from './profile';
import staffs from './staffs';
import staff from './staff';
import priceTypes from './priceTypes';
import priceType from './priceType';
import clientTypes from './clientTypes';
import clientType from './clientType';
import countries from './countries';
import country from './country';
import cities from './cities';
import city from './city';
import currencies from './currencies';
import currency from './currency';
import shops from './shops';
import shop from './shop';
import transportCompanies from './tansportCompanies';
import transportCompany from './transportCompany';
import systemSettings from './systemSettings';
import deliveryCities from './deliveryCities';
import deliveryCity from './deliveryCity';
import pickUpPoints from './pickUpPoints';
import pickUpPoint from './pickUpPoint';
import postamats from './postamats';
import postamat from './postamat';
import warehouse from './warehouse';
import warehouses from './warehouses';
import productTypes from './productTypes';
import productType from './productType';
import catalogSections from './catalogSections';
import catalogSection from './catalogSection';
import features from './features';
import feature from './feature';
import catalogFilters from './catalogFilters';
import catalogFilter from './catalogFilter';
import products from './products';
import product from './product';
import oneClickOrder from './oneClickOrder';
import oneClickOrders from './oneClickOrders';
import yandexYaml from './yandexYaml';
import brands from './brands';
import brand from './brand';
import materials from './materials';
import material from './material';
import seoCatalog from './seoCatalog';
import seoCatalogItem from './seoCatalogItem';
import tiledCatalog from './tiledCatalog';
import clients from './clients';
import bonusPrograms from './bonusPrograms';
import bonusProgram from './bonusProgram';
import orders from './orders';
import order from './order';
import paymentMethods from './paymentMethods';
import paymentMethod from './paymentMethod';
import reportTotalSales from './reportTotalSales';
import qa from './qa';
import serviceCenter from './serviceCenter';
import serviceCenters from './serviceCenters';
import lotteryResults from './lotteryResults';
import lotteryPrize from './lotteryPrize';
import lotteryTickets from './lotteryTickets';
import lotteryApps from './lotteryApps';
import lotteryApp from './lotteryApp';
import matrixTypes from './matrixTypes';
import matrixType from './matrixType';
import yandexWordstat from './yandexWordstat';
import productParameterMigration from './productParameterMigration';
import productsByParameter from './productsByParameter';
import catalogImages from './catalogImages';
import productPhotosArchiveByArticles from './productPhotosArchiveByArticles';
import realProjects from './realProjects';
import realProject from './realProject';

import { textEn, textRu } from './menus';
import { textEn as en, textRu as ru } from './breadcrumb';
import { textEn as errEn, textRu as errRu } from './generalErrors';
import { textEn as msgEn, textRu as msgRu } from './commonMessages';
import { textEn as dayEn, textRu as dayRu } from './weekDays';

const merge = (translation) =>
({
	en: { text: { ...(translation?.en?.text) ? translation.en.text : {}, ...textEn, ...en, ...errEn, ...msgEn, ...dayEn } },
	ru: { text: { ...(translation?.ru?.text) ? translation.ru.text : {}, ...textRu, ...ru, ...errRu, ...msgRu, ...dayRu } }
});

export default (pageId: string): {} => {
	switch (pageId) {
		case '/pages/staff/login/index':
			return merge(login);
		case '/pages/staff/password-recovery/first-step':
			return merge(sendCode);
		case '/pages/staff/password-recovery/second-step':
			return merge(confirmCode);
		case '/pages/staff/password-recovery/third-step':
			return merge(setNewPassword);
		case '/pages/dashboard/staff-groups/item':
			return merge(newStaffGroup);
		case '/pages/dashboard/staff-groups/index':
			return merge(staffGroups);
		case '/pages/dashboard/profile/index':
			return merge(profile);
		case '/pages/dashboard/staff/index':
			return merge(staffs);
		case '/pages/dashboard/staff/create':
			return merge(staff);
		case '/pages/dashboard/staff/edit/id':
			return merge(staff);
		case '/pages/dashboard/price-types/index':
			return merge(priceTypes);
		case '/pages/dashboard/price-types/item':
			return merge(priceType);
		case '/pages/dashboard/client-types/index':
			return merge(clientTypes);
		case '/pages/dashboard/client-types/item':
			return merge(clientType);
		case '/pages/dashboard/countries/index':
			return merge(countries);
		case '/pages/dashboard/countries/item':
			return merge(country);
		case '/pages/dashboard/cities/index':
			return merge(cities);
		case '/pages/dashboard/cities/item':
			return merge(city);
		case '/pages/dashboard/currencies/index':
			return merge(currencies);
		case '/pages/dashboard/currencies/item':
			return merge(currency);
		case '/pages/dashboard/shops/index':
			return merge(shops);
		case '/pages/dashboard/shops/item':
			return merge(shop);
		case '/pages/dashboard/transport-companies/index':
			return merge(transportCompanies);
		case '/pages/dashboard/transport-companies/create':
			return merge(transportCompany);
		case '/pages/dashboard/transport-companies/edit/id':
			return merge(transportCompany);
		case '/pages/dashboard/modules/settings/setting':
			return merge(systemSettings);
		case '/pages/dashboard/settings/index':
			return merge(systemSettings);
		case '/pages/dashboard/delivery-cities/index':
			return merge(deliveryCities);
		case '/pages/dashboard/delivery-cities/item':
			return merge(deliveryCity);
		case '/pages/dashboard/pickup-points/index':
			return merge(pickUpPoints);
		case '/pages/dashboard/pickup-points/item':
			// Сначала transportCompany (модалка передачи заказов), затем pickUpPoint — чтобы не затереть header/header_edit ПВЗ
			return merge({
				en: { text: { ...transportCompany.en.text, ...pickUpPoint.en.text } },
				ru: { text: { ...transportCompany.ru.text, ...pickUpPoint.ru.text } },
			});
		case '/pages/dashboard/postamats/index':
			return merge(postamats);
		case '/pages/dashboard/postamats/item':
			return merge(postamat);
		case '/pages/dashboard/warehouses/index':
			return merge(warehouses);
		case '/pages/dashboard/warehouses/item':
			return merge(warehouse);
		case '/pages/dashboard/product-types/index':
			return merge(productTypes);
		case '/pages/dashboard/product-types/item':
			return merge(productType);
		case '/pages/dashboard/catalog-sections/index':
			return merge(catalogSections);
		case '/pages/dashboard/catalog-sections/order':
			return merge(catalogSections);
		case '/pages/dashboard/catalog-sections/item':
			return merge(catalogSection);
		case '/pages/dashboard/features/index':
			return merge(features);
		case '/pages/dashboard/features/item':
			return merge(feature);
		case '/pages/dashboard/catalog-filters/index':
			return merge(catalogFilters);
		case '/pages/dashboard/catalog-filters/create':
			return merge(catalogFilter);
		case '/pages/dashboard/catalog-filters/edit/id':
			return merge(catalogFilter);
		case '/pages/dashboard/products/index':
			return merge(products);
		case '/pages/dashboard/products/item':
			return merge(product);
		case '/pages/dashboard/brands/index':
			return merge(brands);
		case '/pages/dashboard/brands/item':
			return merge(brand);
		case '/pages/dashboard/materials/index':
			return merge(materials);
		case '/pages/dashboard/materials/item':
			return merge(material);
		case '/pages/dashboard/sales/one-click-order/index':
			return merge(oneClickOrders);
		case '/pages/dashboard/sales/sections-one-click-order/index':
			return merge(oneClickOrder);
		case '/pages/dashboard/sections-one-click-order/index':
			return merge(oneClickOrder);
		case '/pages/dashboard/yml/index':
			return merge(yandexYaml);
		case '/pages/dashboard/seo-catalog/index':
			return merge(seoCatalog);
		case '/pages/dashboard/seo-catalog/item':
			return merge(seoCatalogItem);
		case '/pages/dashboard/tiled-catalog/index':
			return merge(tiledCatalog);
		case '/pages/dashboard/sales/clients/index':
			return merge(clients);
		case '/pages/dashboard/bonus-program/index':
			return merge(bonusPrograms);
		case '/pages/dashboard/bonus-program/item':
			return merge(bonusProgram);
		case '/pages/dashboard/sales/orders/index':
			return merge(orders);
		case '/pages/dashboard/sales/orders/item':
			return merge(order);
		case '/pages/dashboard/payment-methods/index':
			return merge(paymentMethods);
		case '/pages/dashboard/payment-methods/item':
			return merge(paymentMethod);
		case '/pages/dashboard/reports/total-sales/index':
			return merge(reportTotalSales);
		case '/pages/dashboard/sales/qa/index':
			return merge(qa);
		case '/pages/dashboard/service-centers/index':
			return merge(serviceCenters);
		case '/pages/dashboard/service-centers/item':
			return merge(serviceCenter);
		case '/pages/dashboard/lottery/index':
			return merge(lotteryResults);
		case '/pages/dashboard/lottery/prize':
			return merge(lotteryPrize);
		case '/pages/dashboard/lottery/apps':
			return merge(lotteryApps);
		case '/pages/dashboard/lottery/app':
			return merge(lotteryApp);
		case '/pages/dashboard/lottery/tickets':
			return merge(lotteryTickets);
		case '/pages/dashboard/matrix-types/index':
			return merge(matrixTypes);
		case '/pages/dashboard/matrix-types/item':
			return merge(matrixType);
		case '/pages/dashboard/yandex-wordstat/index':
			return merge(yandexWordstat);
		case '/pages/dashboard/product-parameter-migration/index':
			return merge(productParameterMigration);
		case '/pages/dashboard/products-by-parameter/index':
			return merge(productsByParameter);
		case '/pages/dashboard/catalog-images/index':
			return merge(catalogImages);
		case '/pages/dashboard/catalog-images/item':
			return merge(catalogImages);
		case '/pages/dashboard/product-photos-by-articles-archive/index':
			return merge(productPhotosArchiveByArticles);
		case '/pages/dashboard/real-projects/index':
			return merge(realProjects);
		case '/pages/dashboard/real-projects/item':
			return merge(realProject);
	}
	return merge({});
};
