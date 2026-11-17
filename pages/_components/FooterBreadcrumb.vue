<template>
	<div v-show="show" class="footer-nav">
		<ul class="footer-nav__list">
			<li v-for="(item, index) in path" :key="index" class="footer-nav__item">
				<a
					:href="item.active ? item.href : undefined"
					:class="!item.href || !item.active ? 'footer-nav__link--current' : 'footer-nav__link'">
					{{ item.name }}
				</a>
			</li>
		</ul>
	</div>
</template>

<script lang="ts">
import { onMounted, watch } from '@vue/runtime-core';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
	props: {
		navigationTree: {
			type: Object,
			required: true,
		},
		show: {
			type: Boolean,
			required: true,
		},
		id: {
			type: String,
			required: false,
		},
	},

	setup(props) {
		const path = ref([]);
		const localization = useI18n();

		const mapLinks = {
			'/dashboard': () => localization.t('text.breadcrumb_dashboard'),
			// '/dashboard/orders': () => localization.t('text.orders_from_site'),
			'/dashboard/modules': () => localization.t('text.breadckumb_modules'),
			'/dashboard/modules/settings/:setting': () => localization.t('text.breadcrumb_settings'),
			'/dashboard/sales': () => localization.t('text.breadcrumb_sales'),
			'/dashboard/sales/orders': () => localization.t('text.orders_from_site'),
			'/dashboard/sales/orders/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.orders_from_site_item')
					: localization.t('text.orders_from_site_item'),
			'/dashboard/sales/one-click-order': () => localization.t('text.one_click_order'),
			'/dashboard/sales/clients': () => localization.t('text.clients'),
			'/dashboard/settings': () => localization.t('text.breadcrumb_settings'),

			'/dashboard/staff-groups': () => localization.t('text.breadcrumb_staff_groups'),
			'/dashboard/staff-groups/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_edit_staff_group')
					: localization.t('text.breadcrumb_new_staff_group'),

			'/dashboard/client-types': () => localization.t('text.breadcrumb_client_type'),
			'/dashboard/client-types/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_client_type_edit')
					: localization.t('text.breadcrumb_client_type_new'),

			'/dashboard/bonus-program': () => localization.t('text.breadcrumb_bonus_program'),
			'/dashboard/bonus-program/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_bonus_program_edit')
					: localization.t('text.breadcrumb_bonus_program_new'),

			'/dashboard/price-types': () => localization.t('text.breadcrumb_price_types'),
			'/dashboard/price-types/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_price_type_edit')
					: localization.t('text.breadcrumb_price_type_new'),

			'/dashboard/countries': () => localization.t('text.breadcrumb_countries'),
			'/dashboard/countries/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_countries_edit')
					: localization.t('text.breadcrumb_countries_new'),

			'/dashboard/cities': () => localization.t('text.breadcrumb_cities'),
			'/dashboard/cities/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_cities_edit')
					: localization.t('text.breadcrumb_cities_new'),

			'/dashboard/currencies': () => localization.t('text.breadcrumb_currencies'),
			'/dashboard/currencies/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_currencies_edit')
					: localization.t('text.breadcrumb_currencies_new'),

			'/dashboard/shops': () => localization.t('text.breadcrumb_shops'),
			'/dashboard/shops/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_shops_edit')
					: localization.t('text.breadcrumb_shops_new'),

			'/dashboard/brands': () => localization.t('text.breadcrumb_brands'),
			'/dashboard/brands/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_brands_edit')
					: localization.t('text.breadcrumb_brands_new'),

			'/dashboard/warehouses': () => localization.t('text.breadcrumb_warehouses'),
			'/dashboard/warehouses/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_warehouses_edit')
					: localization.t('text.breadcrumb_warehouses_new'),

			'/dashboard/pickup-points': () => localization.t('text.breadcrumb_pickup_points'),
			'/dashboard/pickup-points/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_pickup_points_edit')
					: localization.t('text.breadcrumb_pickup_points_new'),

			'/dashboard/postamats': () => localization.t('text.breadcrumb_postamats'),
			'/dashboard/postamats/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_postamats_edit')
					: localization.t('text.breadcrumb_postamats_new'),

			'/dashboard/delivery-cities': () => localization.t('text.breadcrumb_delivery_cities'),
			'/dashboard/delivery-cities/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_delivery_cities_edit')
					: localization.t('text.breadcrumb_delivery_cities_new'),
			'/dashboard/products': () => localization.t('text.breadcrumb_products'),
			'/dashboard/products/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_products_edit')
					: localization.t('text.breadcrumb_products_new'),

			'/dashboard/product-types': () => localization.t('text.breadcrumb_product_types'),
			'/dashboard/product-types/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_product_types_edit')
					: localization.t('text.breadcrumb_product_types_new'),

			'/dashboard/catalog-sections': () => localization.t('text.breadcrumb_catalog_sections'),
			'/dashboard/catalog-sections/order': () => localization.t('text.breadcrumb_catalog_sections_order'),
			'/dashboard/catalog-sections/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_catalog_sections_edit')
					: localization.t('text.breadcrumb_catalog_sections_new'),

			'/dashboard/features': () => localization.t('text.breadcrumb_features'),
			'/dashboard/features/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_features_edit')
					: localization.t('text.breadcrumb_features_new'),

			'/dashboard/materials': () => localization.t('text.breadcrumb_materials'),
			'/dashboard/materials/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_materials_edit')
					: localization.t('text.breadcrumb_materials_new'),

			'/dashboard/catalog-images': () => localization.t('text.breadcrumb_catalog_images'),
			'/dashboard/catalog-images/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_catalog_images_edit')
					: localization.t('text.breadcrumb_catalog_images_new'),

			'/dashboard/yml': () => localization.t('text.breadcrumb_yml'),
			'/dashboard/yml/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_yml_edit')
					: localization.t('text.breadcrumb_yml_new'),

			'/dashboard/payment-methods': () => localization.t('text.breadcrumb_payment_methods'),
			'/dashboard/payment-methods/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_payment_methods_edit')
					: localization.t('text.breadcrumb_payment_methods_new'),

			'/dashboard/catalog-filters': () => localization.t('text.breadcrumb_catalog_filters'),
			'/dashboard/catalog-filters/create': () => localization.t('text.breadcrumb_catalog_filters_new'),
			'/dashboard/catalog-filters/edit/:id': () => localization.t('text.breadcrumb_catalog_filters_edit'),

			'/dashboard/staff': () => localization.t('text.breadcrumb_staff'),
			'/dashboard/staff/create': () => localization.t('text.breadcrumb_staff_new'),
			'/dashboard/staff/edit/:id': () => localization.t('text.breadcrumb_staff_edit'),

			'/dashboard/transport-companies': () => localization.t('text.breadcrumb_transport_companies'),
			'/dashboard/transport-companies/create': () => localization.t('text.breadcrumb_transport_companies_new'),
			'/dashboard/transport-companies/edit/:id': () => localization.t('text.breadcrumb_transport_companies_edit'),

			'/dashboard/profile': () => localization.t('text.breadcrumb_profile'),

			'/dashboard/tiled-catalog': () => localization.t('text.breadcrumb_tiled_edit'),
			'/dashboard/sections-one-click-order': () => localization.t('text.breadcrumb_oneclick_orders_edit'),
			'/dashboard/seo-catalog': () => localization.t('text.breadcrumb_subsection_seo'),

			'/dashboard/reports': () => localization.t('text.breadcrumb_reports'),
			'/dashboard/reports/total-sales': () => localization.t('text.breadcrumb_reports_total_sales'),

			'/dashboard/sales/qa': () => localization.t('text.breadcrumb_qa'),

			'/dashboard/lottery': () => localization.t('text.breadcrumb_lottery_results'),
			'/dashboard/lottery/prize': () => localization.t('text.breadcrumb_lottery_prize'),
			'/dashboard/lottery/apps': () => localization.t('text.breadcrumb_lottery_apps'),
			'/dashboard/lottery/app?id=:id': () => localization.t('text.breadcrumb_lottery_app'),
			'/dashboard/lottery/tickets': () => localization.t('text.breadcrumb_lottery_tickets'),
			'/dashboard/service-centers': () => localization.t('text.breadcrumb_service_centers'),
			'/dashboard/service-centers/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_service_centers_edit')
					: localization.t('text.breadcrumb_service_centers_new'),

			'/dashboard/matrix-types': () => localization.t('text.breadcrumb_matrix_types'),
			'/dashboard/matrix-types/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_matrix_type_edit')
					: localization.t('text.breadcrumb_matrix_type_new'),
			'/dashboard/real-projects': () => localization.t('text.breadcrumb_real_projects'),
			'/dashboard/real-projects/item': () =>
				new URLSearchParams(window.location.search).get('edit')
					? localization.t('text.breadcrumb_real_project_edit')
					: localization.t('text.breadcrumb_real_project_new'),
			'/dashboard/yandex-wordstat': () => localization.t('text.breadcrumb_yandex_wordstat'),
			'/dashboard/product-parameter-migration': () => localization.t('text.breadcrumb_product_parameter_migration'),
			'/dashboard/products-by-parameter': () => localization.t('text.breadcrumb_products_by_parameter'),
			'/dashboard/product-photos-by-articles-archive': () =>
				localization.t('text.breadcrumb_product_photos_archive_by_articles'),
		};

		/* eslint-disable */
		const traverseNavTree = (navTree, path: Array<any>, link: string) => {
			// Получаем название из mapLinks только если есть соответствующий ключ
			if (mapLinks[navTree.link]) {
				navTree.name = mapLinks[navTree.link]();
			}
			
			const currentLinkSegments = link.split('/');
			const linkSegments = navTree.link.split('/');
			let index = 0;
			if (
				navTree.link.endsWith('/:id') &&
				currentLinkSegments.length === linkSegments.length &&
				linkSegments.every(item => {
					if (index === currentLinkSegments.length - 1) {
						return true;
					}
					return item === currentLinkSegments[index++];
				})
			) {
				navTree.link = link;
			}
			if (
				navTree.link.endsWith('/:setting') &&
				currentLinkSegments.length === linkSegments.length &&
				linkSegments.every(item => {
					if (index === currentLinkSegments.length - 1) {
						return true;
					}
					return item === currentLinkSegments[index++];
				})
			) {
				navTree.link = link;
			}

			path.push({
				name: navTree.name,
				href: navTree.link,
				active: navTree.active,
			});
			if (navTree.link === link) {
				return true;
			}
			if (navTree.children) {
				for (const child of navTree.children) {
					const success = traverseNavTree(child, path, link);
					if (success) {
						return success;
					}
					path.pop();
				}
			}
			return false;
		};

		const buildPath = () => {
			path.value = [];
			if (traverseNavTree(props.navigationTree, path.value, window.location.pathname)) {
				delete (path.value[path.value.length - 1] as any).href;
			}
		};

		onMounted(() => {
			buildPath();
		});
		return {
			path,
		};
	},
};
</script>
