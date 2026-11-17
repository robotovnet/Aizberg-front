import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export default function useProductData() {
	const localization: any = useI18n();

	const guid = () => {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}

		return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
	};

	const stockStatusOptions = ref([
		{
			name: localization.t('text.available'),
			value: 'in_stock',
		},
		{
			name: localization.t('text.under_order'),
			value: 'pre_order',
		},
		{
			name: localization.t('text.not_available'),
			value: 'out_of_stock',
		},
	]);

	const errorNames = [
		'ad_generator',
		'ad_generator.alt_names',
		'ad_generator.pn',
		'ad_yandex_market',
		'ad_yandex_market.is_active',
		'ad_yandex_market.name',
		'ad_yandex_market.overview_text',
		'ad_yandex_market.picture_url',
		'brand_id',
		'catalog_section_id',
		'catalog_section_id.*',
		'copy_data_to_similar_products',
		'copy_data_to_similar_products.alt_names',
		'copy_data_to_similar_products.brand',
		'copy_data_to_similar_products.desc',
		'copy_data_to_similar_products.features',
		'copy_data_to_similar_products.pn',
		'copy_data_to_similar_products.related_products',
		'features',
		'features.0.feature_id',
		'features.0.value',
		'features.1.feature_id',
		'features.1.value',
		'features.2.feature_id',
		'features.2.value',
		'features.3.feature_id',
		'features.3.value',
		'features.4.feature_id',
		'features.4.value',
		'features.5.feature_id',
		'features.5.value',
		'features.6.feature_id',
		'features.6.value',
		'features.7.feature_id',
		'features.7.value',
		'is_hidden',
		'names',
		'names.0.value',
		'overview_texts',
		'overview_texts.0.value',
		'prices',
		'prices.*.price_type_id',
		'prices.*.value',
		'product_group_id',
		'related_products',
		'related_products.*',
		'similar_products',
		'similar_products.*',
		'stock_status',
		'uuid',
		'vendor_code',
	];
	return {
		stockStatusOptions,
		errorNames,
		guid,
	};
}
