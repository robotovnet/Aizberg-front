<template>
	<AppPage
		:title="$t('text.header')"
		:canEdit="canEdit"
		:handler="() => {}"
		v-if="canView">
		
		<!-- Шаг 1: Выбор параметра -->
		<div v-if="currentStep === 'select-parameter'" class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.select_parameter') }}</span>
				<select 
					class="main__select select" 
					v-model="selectedParameterId"
					@change="onParameterChange"
					:disabled="loadingValues">
					<option value="0" disabled selected>{{ $t('text.parameter_placeholder') }}</option>
					<option 
						v-for="parameter in parameters" 
						:key="parameter.id" 
						:value="parameter.id">
						{{ parameter.name }}
					</option>
				</select>
			</div>
		</div>

		<!-- Шаг 2: Список значений параметра -->
		<div v-if="currentStep === 'parameter-values'" class="main__content">
			<div class="main__inner main__inner--short">
				<button 
					class="btn btn--secondary" 
					@click="backToParameterSelection">
					← {{ $t('text.select_parameter') }}
				</button>
			</div>
			
			<div class="main__inner">
				<h3 class="main__text">{{ $t('text.parameter_values') }}: {{ selectedParameterName }}</h3>
			</div>

			<div v-if="parameterValues.length === 0" class="main__inner">
				<p class="main__text" style='color: red; font-size: 15px;'>{{ $t('text.no_values_found') }}</p>
			</div>

			<div v-else class="parameter-values-grid">
				<div 
					v-for="(value, index) in parameterValues" 
					:key="index"
					class="parameter-value-item"
					@click="selectParameterValue(value)">
					{{ value }}
				</div>
			</div>
		</div>

		<!-- Шаг 3: Список товаров -->
		<div v-if="currentStep === 'products-list'" class="main__content">
			<div class="main__inner main__inner--short">
				<button 
					class="btn btn--secondary" 
					@click="backToValues">
					← {{ $t('text.back_to_values') }}
				</button>
			</div>
			
			<div class="main__inner">
				<h3 class="main__text">
					{{ $t('text.products_list') }}: {{ selectedParameterName }} = {{ selectedValue }}
				</h3>
			</div>

			<div v-if="products.length === 0" class="main__inner">
				<p class="main__text">{{ $t('text.no_products_found') }}</p>
			</div>

			<div v-else class="list list--three">
				<div class="list__item" style="background-color: #FAFAFA;">
					<span class="list__elem list__elem--name" style="color: #9e9e9e;">{{ $t('text.product_name') }}</span>
					<span class="list__elem list__elem--code" style="color: #9e9e9e;">{{ $t('text.vendor_code') }}</span>
					<span class="list__elem list__elem--link" style="color: #9e9e9e;">{{ $t('text.product_link') }}</span>
				</div>
				
				<div 
					v-for="product in products" 
					:key="product.id"
					class="list__item">
					<span class="list__elem list__elem--name">
						{{ product.name }}
					</span>
					<span class="list__elem list__elem--code">
						{{ product.vendor_code }}
					</span>
					<span class="list__elem list__elem--link">
						<a 
							:href="removeSubdomain(product.url)" 
							target="_blank" 
							class="main__product-name"
							:title="$t('text.open_in_site')">
							{{ $t('text.open_in_site') }}
						</a>
					</span>
				</div>
			</div>
		</div>

		<div class="main__content">
			<div v-if="loadingValues || loadingProducts" class="main__inner">
				<p class="main__text">{{ $t('text.loading') }}</p>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import redirect from '../../../utils/redirect';
import catalogFeaturesService from '../../../services/catalogFeaturesService';
import toaster from '../../../utils/toaster';
import { removeSubdomain } from '../../../utils/constants';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const { canEdit, canView } = usePageInit('catalog.features');

// Состояние приложения
const currentStep = ref<'select-parameter' | 'parameter-values' | 'products-list'>('select-parameter');
const loadingParameters = ref(false);
const loadingValues = ref(false);
const loadingProducts = ref(false);

// Данные
const parameters = ref([]);
const selectedParameterId = ref(0);
const selectedParameterName = ref('');
const parameterValues = ref([]);
const selectedValue = ref('');
const products = ref([]);

onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	
	// Загружаем список всех параметров
	await loadParameters();
});

// Загрузка списка параметров
const loadParameters = async () => {
	loadingParameters.value = true;
	try {
		const response = await catalogFeaturesService.getAll(
			localization, 
			errMsg => toaster.error(toast, errMsg)
		);
		parameters.value = response || [];
	} catch (error) {
		console.error('Error loading parameters:', error);
		toaster.error(toast, 'Ошибка при загрузке параметров');
		parameters.value = [];
	} finally {
		loadingParameters.value = false;
	}
};

// Обработчик выбора параметра
const onParameterChange = async () => {
	if (selectedParameterId.value === 0) return;
	
	// Находим название выбранного параметра
	const selectedParameter = parameters.value.find(p => p.id === selectedParameterId.value);
	if (!selectedParameter) return;
	
	selectedParameterName.value = selectedParameter.name;
	
	// Загружаем значения параметра
	await loadParameterValues();
	
	// Переходим к следующему шагу
	currentStep.value = 'parameter-values';
};

// Загрузка значений параметра
const loadParameterValues = async () => {
	console.log('loadParameterValues: starting, loadingValues =', loadingValues.value);
	loadingValues.value = true;
	console.log('loadParameterValues: set loadingValues =', loadingValues.value);
	try {
		const response = await catalogFeaturesService.getValues(
			localization,
			selectedParameterId.value,
			errMsg => toaster.error(toast, errMsg)
		);
		parameterValues.value = response || [];
		console.log('loadParameterValues: got response =', response);
	} catch (error) {
		console.error('Error loading parameter values:', error);
		toaster.error(toast, 'Ошибка при загрузке значений параметра');
		parameterValues.value = [];
	} finally {
		loadingValues.value = false;
		console.log('loadParameterValues: finished, loadingValues =', loadingValues.value);
	}
};

// Выбор значения параметра
const selectParameterValue = async (value) => {
	selectedValue.value = value;
	
	// Загружаем товары с выбранным значением параметра
	await loadProductsByValue(value);
	
	// Переходим к списку товаров
	currentStep.value = 'products-list';
};

// Загрузка товаров по значению параметра
const loadProductsByValue = async (value) => {
	console.log('loadProductsByValue: starting, loadingProducts =', loadingProducts.value);
	loadingProducts.value = true;
	console.log('loadProductsByValue: set loadingProducts =', loadingProducts.value);
	try {
		const data = {
			value: value
		};
		
		const response = await catalogFeaturesService.getProductsByValue(
			localization,
			selectedParameterId.value,
			data,
			[],
			errMsg => toaster.error(toast, errMsg)
		);
		
		products.value = response || [];
		console.log('loadProductsByValue: got response =', response);
	} catch (error) {
		console.error('Error loading products by value:', error);
		toaster.error(toast, 'Ошибка при загрузке товаров');
		products.value = [];
	} finally {
		loadingProducts.value = false;
		console.log('loadProductsByValue: finished, loadingProducts =', loadingProducts.value);
	}
};

// Возврат к выбору параметра
const backToParameterSelection = () => {
	currentStep.value = 'select-parameter';
	selectedParameterId.value = 0;
	selectedParameterName.value = '';
	parameterValues.value = [];
	selectedValue.value = '';
	products.value = [];
	loadingValues.value = false;
	loadingProducts.value = false;
};

// Возврат к значениям параметра
const backToValues = () => {
	currentStep.value = 'parameter-values';
	selectedValue.value = '';
	products.value = [];
	loadingProducts.value = false;
};
</script>

<style scoped>
.parameter-values-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 15px;
	margin-top: 20px;
}

.parameter-value-item {
	padding: 15px;
	border: 1px solid #ddd;
	border-radius: 5px;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: center;
	background-color: #f9f9f9;
}

.parameter-value-item:hover {
	background-color: #e9e9e9;
	border-color: #428AB4;
	transform: translateY(-2px);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn--secondary {
	margin-bottom: 20px;
}

.btn--secondary:hover {
	background-color: #f9f9f9;;
}

.main__text {
	font-size: 16px;
	font-weight: 500;
	margin-bottom: 10px;
}

.list--three .list__elem:first-child {
	max-width: 100%;
}

.list--three .list__elem:nth-child(2) {
	max-width: 100%;
}

.list--three .list__elem:last-child {
	max-width: 100%;
}

.list--three .list__heading {
	text-align: left;
	padding: 10px;
}

.list--three .list__elem {
	padding: 10px;
	vertical-align: top;
}

.list__elem--name {
	width: 50%;
}

.list__elem--code {
	width: 25%;
}

.list__elem--link {
	width: 25%;
}

.main__product-name {
	color: #428AB4;
	text-decoration: none;
}

.main__product-name:hover {
	text-decoration: underline;
}

.list__elem--link:after {
	display: none;
}
</style> 