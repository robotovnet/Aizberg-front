<template>
	<AppPage
		:title="$t('text.header')"
		:canEdit="canEdit"
		:handler="() => {}"
		v-if="canView">
		
		<!-- Шаг 1: Выбор исходного параметра -->
		<div v-if="currentStep === 'select-source-parameter'" class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.select_source_parameter') }}</span>
				<select 
					class="main__select select" 
					v-model="selectedSourceParameterId"
					@change="onSourceParameterChange"
					:disabled="loadingParameters">
					<option value="0" disabled selected>{{ $t('text.select_parameter_placeholder') }}</option>
					<option 
						v-for="parameter in parameters" 
						:key="parameter.id" 
						:value="parameter.id">
						{{ parameter.name }}
					</option>
				</select>
			</div>
		</div>

		<!-- Шаг 2: Выбор значения параметра -->
		<div v-if="currentStep === 'select-parameter-value'" class="main__content">
			<div class="main__inner main__inner--short">
				<button 
					class="btn btn--secondary" 
					@click="backToSourceParameterSelection">
					{{ $t('text.back_to_parameter_selection') }}
				</button>
			</div>
			
			<div class="main__inner">
				<h3 class="main__text">{{ $t('text.parameter_values') }}: {{ selectedSourceParameterName }}</h3>
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

		<!-- Шаг 3: Выбор целевого параметра -->
		<div v-if="currentStep === 'select-target-parameter'" class="main__content">
			<div class="main__inner main__inner--short">
				<button 
					class="btn btn--secondary" 
					@click="backToValues">
					{{ $t('text.back_to_values') }}
				</button>
			</div>
			
			<div class="main__inner">
				<h3 class="main__text">
					{{ $t('text.select_target_parameter') }}: {{ selectedSourceParameterName }} = {{ selectedValue }}
				</h3>
			</div>

			<div class="main__inner main__inner--short">
				<select 
					class="main__select select" 
					v-model="selectedTargetParameterId"
					@change="onTargetParameterChange">
					<option value="0" disabled selected>{{ $t('text.select_target_parameter_placeholder') }}</option>
					<option 
						v-for="parameter in availableTargetParameters" 
						:key="parameter.id" 
						:value="parameter.id">
						{{ parameter.name }}
					</option>
				</select>
			</div>
		</div>

		<!-- Шаг 4: Ввод нового значения и миграция -->
		<div v-if="currentStep === 'migration'" class="main__content">
			<div class="main__inner main__inner--short">
				<button 
					class="btn btn--secondary" 
					@click="backToTargetParameterSelection">
					{{ $t('text.back_to_parameter_selection') }}
				</button>
			</div>
			
			<div class="main__inner">
				<h3 class="main__text">
					{{ $t('text.migration_title') }}: {{ selectedSourceParameterName }} = {{ selectedValue }} → {{ selectedTargetParameterName }}
				</h3>
			</div>

			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.enter_new_value') }}</span>
				<input 
					type="text" 
					class="main__input input" 
					v-model="newValue"
					:placeholder="$t('text.new_value_placeholder')"
					:required="isSameParameter"
				/>
				<p v-if="isSameParameter" class="main__text" style="padding-left: 14px; color: #ff9800; font-size: 14px; margin-top: 5px;">
					{{ $t('text.same_parameter_warning') }}
				</p>
			</div>

			<div class="main__inner main__inner--short">
				<button 
					class="btn btn--primary" 
					@click="performMigration"
					:disabled="performingMigration || (isSameParameter && (!newValue.trim() || newValue.trim() === selectedValue))">
					{{ performingMigration ? $t('text.loading') : $t('text.perform_migration') }}
				</button>
			</div>
		</div>

		<!-- Результат миграции -->
		<div v-if="migrationResult" class="main__content">
			<div class="main__inner">
				<div class="migration-result" :class="{ 'success': migrationResult.migrated_count > 0, 'error': migrationResult.migrated_count === 0 }">
					<h4>{{ migrationResult.message }}</h4>
					<div v-if="migrationResult.migrated_count > 0" class="migration-details">
						<p><strong>{{ $t('text.migrated_records') }}:</strong> {{ migrationResult.migrated_count }}</p>
						<p><strong>{{ $t('text.source_parameter') }}:</strong> {{ migrationResult.source_feature_id }}</p>
						<p><strong>{{ $t('text.target_parameter') }}:</strong> {{ migrationResult.target_feature_id }}</p>
						<p><strong>{{ $t('text.current_value') }}:</strong> {{ migrationResult.current_value }}</p>
						<p><strong>{{ $t('text.new_value') }}:</strong> {{ migrationResult.new_value || $t('text.not_changed') }}</p>
					</div>
				</div>
			</div>
		</div>

		<div class="main__content">
			<div v-if="loadingParameters || loadingValues" class="main__inner">
				<p class="main__text">{{ $t('text.loading') }}</p>
			</div>
		</div>
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import redirect from '../../../utils/redirect';
import catalogFeaturesService from '../../../services/catalogFeaturesService';
import toaster from '../../../utils/toaster';

const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();
const { canEdit, canView } = usePageInit('catalog.features');

// Состояние приложения
const currentStep = ref<'select-source-parameter' | 'select-parameter-value' | 'select-target-parameter' | 'migration'>('select-source-parameter');
const loadingParameters = ref(false);
const loadingValues = ref(false);
const performingMigration = ref(false);

// Данные
const parameters = ref([]);
const selectedSourceParameterId = ref(0);
const selectedSourceParameterName = ref('');
const parameterValues = ref([]);
const selectedValue = ref('');
const selectedTargetParameterId = ref(0);
const selectedTargetParameterName = ref('');
const newValue = ref('');
const migrationResult = ref(null);

// Вычисляем доступные целевые параметры (теперь можно выбрать тот же параметр)
const availableTargetParameters = computed(() => {
	return parameters.value;
});

// Проверяем, выбран ли тот же параметр
const isSameParameter = computed(() => {
	return selectedSourceParameterId.value === selectedTargetParameterId.value && selectedTargetParameterId.value !== 0;
});

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
		toaster.error(toast, localization.t('text.error_loading_parameters'));
		parameters.value = [];
	} finally {
		loadingParameters.value = false;
	}
};

// Обработчик выбора исходного параметра
const onSourceParameterChange = async () => {
	if (selectedSourceParameterId.value === 0) return;
	
	// Находим название выбранного параметра
	const selectedParameter = parameters.value.find(p => p.id === selectedSourceParameterId.value);
	if (!selectedParameter) return;
	
	selectedSourceParameterName.value = selectedParameter.name;
	
	// Загружаем значения параметра
	await loadParameterValues();
	
	// Переходим к следующему шагу
	currentStep.value = 'select-parameter-value';
};

// Загрузка значений параметра
const loadParameterValues = async () => {
	loadingValues.value = true;
	try {
		const response = await catalogFeaturesService.getValues(
			localization,
			selectedSourceParameterId.value,
			errMsg => toaster.error(toast, errMsg)
		);
		parameterValues.value = response || [];
	} catch (error) {
		console.error('Error loading parameter values:', error);
		toaster.error(toast, localization.t('text.error_loading_values'));
		parameterValues.value = [];
	} finally {
		loadingValues.value = false;
	}
};

// Выбор значения параметра
const selectParameterValue = (value: string) => {
	selectedValue.value = value;
	currentStep.value = 'select-target-parameter';
};

// Обработчик выбора целевого параметра
const onTargetParameterChange = () => {
	if (selectedTargetParameterId.value === 0) return;
	
	// Находим название выбранного целевого параметра
	const selectedParameter = parameters.value.find(p => p.id === selectedTargetParameterId.value);
	if (!selectedParameter) return;
	
	selectedTargetParameterName.value = selectedParameter.name;
	
	// Переходим к шагу миграции
	currentStep.value = 'migration';
};

// Выполнение миграции
const performMigration = async () => {
	// Валидация: если выбран тот же параметр, новое значение обязательно и должно отличаться от текущего
	if (isSameParameter.value) {
		const trimmedNewValue = newValue.value.trim();
		if (!trimmedNewValue) {
			toaster.error(toast, localization.t('text.new_value_required') || 'Необходимо указать новое значение при переносе в тот же параметр');
			return;
		}
		if (trimmedNewValue === selectedValue.value) {
			toaster.error(toast, localization.t('text.new_value_must_differ') || 'Новое значение должно отличаться от текущего');
			return;
		}
	}
	
	performingMigration.value = true;
	migrationResult.value = null;
	
	try {
		const migrationData = {
			source_feature_id: selectedSourceParameterId.value,
			target_feature_id: selectedTargetParameterId.value,
			current_value: selectedValue.value,
			new_value: newValue.value.trim() || null
		};
		
		const response = await catalogFeaturesService.migrateValues(
			localization,
			migrationData,
			[],
			errMsg => toaster.error(toast, errMsg)
		);
		
		migrationResult.value = response;
		
		if (response.migrated_count > 0) {
			toaster.success(toast, response.message);
		} else {
			toaster.warning(toast, response.message);
		}
		
	} catch (error) {
		console.error('Error performing migration:', error);
		toaster.error(toast, localization.t('text.error_performing_migration'));
	} finally {
		performingMigration.value = false;
	}
};

// Навигация назад
const backToSourceParameterSelection = () => {
	currentStep.value = 'select-source-parameter';
	selectedSourceParameterId.value = 0;
	selectedSourceParameterName.value = '';
	parameterValues.value = [];
	selectedValue.value = '';
	selectedTargetParameterId.value = 0;
	selectedTargetParameterName.value = '';
	newValue.value = '';
	migrationResult.value = null;
};

const backToValues = () => {
	currentStep.value = 'select-parameter-value';
	selectedTargetParameterId.value = 0;
	selectedTargetParameterName.value = '';
	newValue.value = '';
	migrationResult.value = null;
};

const backToTargetParameterSelection = () => {
	currentStep.value = 'select-target-parameter';
	newValue.value = '';
	migrationResult.value = null;
};
</script>

<style scoped>
.content {
	padding: 20px;
}

.content h2 {
	margin-bottom: 20px;
	color: #333;
}

.content p {
	color: #666;
	line-height: 1.6;
}

.parameter-values-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 10px;
	margin-top: 20px;
}

.parameter-value-item {
	padding: 15px;
	border: 1px solid #ddd;
	border-radius: 5px;
	cursor: pointer;
	text-align: center;
	transition: all 0.3s ease;
}

.parameter-value-item:hover {
	background-color: #f5f5f5;
	border-color: #007bff;
}

.migration-result {
	padding: 20px;
	border-radius: 5px;
	margin-top: 20px;
}

.migration-result.success {
	background-color: #d4edda;
	border: 1px solid #c3e6cb;
	color: #155724;
}

.migration-result.error {
	background-color: #f8d7da;
	border: 1px solid #f5c6cb;
	color: #721c24;
}

.migration-details {
	margin-top: 15px;
}

.migration-details p {
	margin: 5px 0;
	color: inherit;
}
</style> 