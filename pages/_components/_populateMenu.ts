export default function () {
	if (window.location.pathname.startsWith('/dashboard/staff-groups')) {
		localStorage.setItem('selected_side_menu_item', '2_users');
		localStorage.setItem('selected_side_menu_sub_item', '3_staff_groups');
	} else if (window.location.pathname.startsWith('/dashboard/staff')) {
		localStorage.setItem('selected_side_menu_item', '2_users');
		localStorage.setItem('selected_side_menu_sub_item', '3_staff');
	} else if (window.location.pathname.startsWith('/dashboard/bonus-program')) {
		localStorage.setItem('selected_side_menu_item', '2_users');
		localStorage.setItem('selected_side_menu_sub_item', '3_bonus_program');
	} else if (window.location.pathname.startsWith('/dashboard/price-types')) {
		localStorage.setItem('selected_side_menu_item', '2_prices');
		localStorage.setItem('selected_side_menu_sub_item', '3_price_types');
	} else if (window.location.pathname.startsWith('/dashboard/client-types')) {
		localStorage.setItem('selected_side_menu_item', '2_users');
		localStorage.setItem('selected_side_menu_sub_item', '3_client_types');
	} else if (window.location.pathname.startsWith('/dashboard/countries')) {
		localStorage.setItem('selected_side_menu_item', '2_cities_warehouses');
		localStorage.setItem('selected_side_menu_sub_item', '3_countries');
	} else if (window.location.pathname.startsWith('/dashboard/cities')) {
		localStorage.setItem('selected_side_menu_item', '2_cities_warehouses');
		localStorage.setItem('selected_side_menu_sub_item', '3_cities');
	} else if (window.location.pathname.startsWith('/dashboard/currencies')) {
		localStorage.setItem('selected_side_menu_item', '2_prices');
		localStorage.setItem('selected_side_menu_sub_item', '3_currencies');
	} else if (window.location.pathname.startsWith('/dashboard/shops')) {
		localStorage.setItem('selected_side_menu_item', '2_cities_warehouses');
		localStorage.setItem('selected_side_menu_sub_item', '3_shops');
	} else if (window.location.pathname.startsWith('/dashboard/warehouses')) {
		localStorage.setItem('selected_side_menu_item', '2_cities_warehouses');
		localStorage.setItem('selected_side_menu_sub_item', '3_warehouses');
	} else if (window.location.pathname.startsWith('/dashboard/transport-companies')) {
		localStorage.setItem('selected_side_menu_item', '2_integrations');
		localStorage.setItem('selected_side_menu_sub_item', '3_delivery');
	} else if (window.location.pathname.startsWith('/dashboard/pickup-points')) {
		localStorage.setItem('selected_side_menu_item', '2_integrations');
		localStorage.setItem('selected_side_menu_sub_item', '3_pickup_points');
	} else if (window.location.pathname.startsWith('/dashboard/postamats')) {
		localStorage.setItem('selected_side_menu_item', '2_integrations');
		localStorage.setItem('selected_side_menu_sub_item', '3_postamats');
	} else if (window.location.pathname.startsWith('/dashboard/reports/total-sales')) {
		localStorage.setItem('selected_side_menu_item', '2_sales');
		localStorage.setItem('selected_side_menu_sub_item', '3_total_sales');
	} else if (window.location.pathname.startsWith('/dashboard/product-types')) {
		localStorage.setItem('selected_side_menu_item', '2_catalogue');
		localStorage.setItem('selected_side_menu_sub_item', '3_product_types');
	} else if (window.location.pathname.startsWith('/dashboard/catalog-sections')) {
		localStorage.setItem('selected_side_menu_item', '2_catalogue');
		localStorage.setItem('selected_side_menu_sub_item', '3_catalog_sections');
	} else if (window.location.pathname.startsWith('/dashboard/features')) {
		localStorage.setItem('selected_side_menu_item', '2_catalogue');
		localStorage.setItem('selected_side_menu_sub_item', '3_features');
	} else if (window.location.pathname.startsWith('/dashboard/catalog-filters')) {
		localStorage.setItem('selected_side_menu_item', '2_catalogue');
		localStorage.setItem('selected_side_menu_sub_item', '3_catalog_filters');
	} else if (window.location.pathname.startsWith('/dashboard/delivery-cities')) {
		localStorage.setItem('selected_side_menu_item', '2_integrations');
		localStorage.setItem('selected_side_menu_sub_item', '3_delivery_city');
	} else if (window.location.pathname.startsWith('/dashboard/brands')) {
		localStorage.setItem('selected_side_menu_item', '2_catalogue');
		localStorage.setItem('selected_side_menu_sub_item', '3_brands');
	} else if (window.location.pathname.startsWith('/dashboard/tiled-catalog')) {
		localStorage.setItem('selected_side_menu_item', '2_catalogue');
		localStorage.setItem('selected_side_menu_sub_item', '3_tiled_catalog');
	} else if (window.location.pathname.startsWith('/dashboard/sections-one-click-order')) {
		localStorage.setItem('selected_side_menu_item', '2_catalogue');
		localStorage.setItem('selected_side_menu_sub_item', '3_oneclick_order');
	} else if (window.location.pathname.startsWith('/dashboard/materials')) {
		localStorage.setItem('selected_side_menu_item', '2_directories');
		localStorage.setItem('selected_side_menu_sub_item', '3_materials');
	} else if (window.location.pathname.startsWith('/dashboard/catalog-images')) {
		localStorage.setItem('selected_side_menu_item', '2_directories');
		localStorage.setItem('selected_side_menu_sub_item', '3_catalog_images');
	} else if (window.location.pathname.startsWith('/dashboard/seo-catalog')) {
		localStorage.setItem('selected_side_menu_item', '2_directories');
		localStorage.setItem('selected_side_menu_sub_item', '3_seo_catalog');
	} else if (window.location.pathname.startsWith('/dashboard/payment-methods')) {
		localStorage.setItem('selected_side_menu_item', '2_integrations');
		localStorage.setItem('selected_side_menu_sub_item', '3_payment_methods');
	} else if (window.location.pathname.startsWith('/dashboard/yml')) {
		localStorage.setItem('selected_side_menu_item', '2_integrations');
		localStorage.setItem('selected_side_menu_sub_item', '3_ad_yml');
	} else if (window.location.pathname.startsWith('/dashboard/sales/one-click-order')) {
		localStorage.setItem('selected_side_menu_item', '2_orders');
		localStorage.setItem('selected_side_menu_sub_item', '3_oneclick_orders');
	} else if (window.location.pathname.startsWith('/dashboard/sales/orders')) {
		localStorage.setItem('selected_side_menu_item', '2_orders');
		localStorage.setItem('selected_side_menu_sub_item', '3_orders');
	} else if (window.location.pathname.startsWith('/dashboard/sales/qa')) {
		localStorage.setItem('selected_side_menu_item', '2_clients');
		localStorage.setItem('selected_side_menu_sub_item', '3_qa');
	} else if (window.location.pathname.startsWith('/dashboard/service-centers')) {
		localStorage.setItem('selected_side_menu_item', '2_integrations');
		localStorage.setItem('selected_side_menu_sub_item', '3_service_centers');
	} else if (window.location.pathname.startsWith('/dashboard/sales/clients')) {
		localStorage.setItem('selected_side_menu_item', '2_clients');
		localStorage.setItem('selected_side_menu_sub_item', '3_clients');
	} else if (window.location.pathname.startsWith('/dashboard/lottery/prize')) {
		localStorage.setItem('selected_side_menu_item', '2_lottery');
		localStorage.setItem('selected_side_menu_sub_item', '3_lottery_prize');
	} else if (window.location.pathname.startsWith('/dashboard/lottery/apps')) {
		localStorage.setItem('selected_side_menu_item', '2_lottery');
		localStorage.setItem('selected_side_menu_sub_item', '3_lottery_apps');
	} else if (window.location.pathname.startsWith('/dashboard/lottery/app')) {
		localStorage.setItem('selected_side_menu_item', '2_lottery');
		localStorage.setItem('selected_side_menu_sub_item', '3_lottery_app');
	} else if (window.location.pathname.startsWith('/dashboard/lottery/tickets')) {
		localStorage.setItem('selected_side_menu_item', '2_lottery');
		localStorage.setItem('selected_side_menu_sub_item', '3_lottery_tickets');
	} else if (window.location.pathname.startsWith('/dashboard/lottery')) {
		localStorage.setItem('selected_side_menu_item', '2_lottery');
		localStorage.setItem('selected_side_menu_sub_item', '3_lottery_results');
	} else if (window.location.pathname.startsWith('/dashboard/matrix-types')) {
		localStorage.setItem('selected_side_menu_item', '2_directories');
		localStorage.setItem('selected_side_menu_sub_item', '3_matrix_types');
	} else if (window.location.pathname.startsWith('/dashboard/real-projects')) {
		localStorage.setItem('selected_side_menu_item', '2_directories');
		localStorage.setItem('selected_side_menu_sub_item', '3_real_projects');
	} else if (window.location.pathname.startsWith('/dashboard/yandex-wordstat')) {
		localStorage.setItem('selected_side_menu_item', '2_directories');
		localStorage.setItem('selected_side_menu_sub_item', '3_yandex_wordstat');
	} else if (window.location.pathname.startsWith('/dashboard/product-parameter-migration')) {
		localStorage.setItem('selected_side_menu_item', '2_catalogue');
		localStorage.setItem('selected_side_menu_sub_item', '3_product_parameter_migration');
	} else if (window.location.pathname.startsWith('/dashboard/products-by-parameter')) {
		localStorage.setItem('selected_side_menu_item', '2_catalogue');
		localStorage.setItem('selected_side_menu_sub_item', '3_products_by_parameter');
	} else if (window.location.pathname.startsWith('/dashboard/product-photos-by-articles-archive')) {
		localStorage.setItem('selected_side_menu_item', '2_catalogue');
		localStorage.setItem('selected_side_menu_sub_item', '3_products');
	} else if (window.location.pathname.startsWith('/dashboard/products')) {
		localStorage.setItem('selected_side_menu_item', '2_catalogue');
		localStorage.setItem('selected_side_menu_sub_item', '3_products');		
	} else {
		localStorage.removeItem('selected_side_menu_sub_item');
	}
}
