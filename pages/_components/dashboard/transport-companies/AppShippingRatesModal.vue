<template>
	<div class="user-info__overlay" :class="overlayCls" @click.self="close"></div>
	<div class="modal shipping-rates-modal" :class="activeCls">
		<div class="modal__wrapper modal__wrapper--long shipping-rates-modal__wrapper">
			<div class="modal__top">
				<h2 class="modal__title">{{ $t('text.transport_company_shipping_rates_title') }}</h2>
			</div>
			<div class="modal__content" v-if="!loadError">
				<div class="shipping-rates-modal__methods">
					<p class="shipping-rates-modal__methods-intro">{{ $t('text.transport_company_shipping_rates_methods_intro') }}</p>
					<div class="shipping-rates-modal__methods-col">
						<label class="checkbox-group">
							<input type="checkbox" v-model="courierDelivery" class="checkbox-group__checkbox" />
							<span>{{ $t('text.transport_company_courier') }}</span>
						</label>
						<label class="checkbox-group">
							<input type="checkbox" v-model="postamats" class="checkbox-group__checkbox" />
							<span>{{ $t('text.transport_company_postomats') }}</span>
						</label>
						<label class="checkbox-group">
							<input type="checkbox" v-model="pickupPoints" class="checkbox-group__checkbox" />
							<span>{{ $t('text.transport_company_pick_up_points') }}</span>
						</label>
					</div>
				</div>
				<div class="shipping-rates-modal__error" v-if="localError">{{ localError }}</div>
				<div class="shipping-rates-modal__rates-block">
					<div class="shipping-rates-modal__table-scroll">
						<table class="shipping-rates-modal__table">
							<thead>
								<tr>
									<th>{{ $t('text.transport_company_shipping_rates_order_from') }}</th>
									<th>{{ $t('text.transport_company_shipping_rates_order_to') }}</th>
									<th>{{ $t('text.transport_company_shipping_rates_delivery_price') }}</th>
									<th class="shipping-rates-modal__th-actions" aria-hidden="true"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(row, idx) in rates" :key="idx">
									<td>
										<input
											type="number"
											class="main__input main__input--sm input shipping-rates-modal__input"
											v-model.number="row.minimum_order_value"
											min="0"
											step="1" />
									</td>
									<td>
										<input
											type="number"
											class="main__input main__input--sm input shipping-rates-modal__input"
											v-model.number="row.maximum_order_value"
											min="0"
											step="1" />
									</td>
									<td>
										<input
											type="number"
											class="main__input main__input--sm input shipping-rates-modal__input"
											v-model.number="row.value"
											min="0"
											step="1" />
									</td>
									<td class="shipping-rates-modal__actions-cell">
										<button
											type="button"
											class="shipping-rates-modal__remove"
											v-if="rates.length > 1"
											@click="removeRow(idx)"
											:title="$t('text.transport_company_shipping_rates_remove')"
											:aria-label="$t('text.transport_company_shipping_rates_remove')">
											<svg
												class="shipping-rates-modal__remove-icon"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												width="20"
												height="20"
												aria-hidden="true"
												focusable="false">
												<path
													fill="currentColor"
													d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
											</svg>
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="shipping-rates-modal__add-wrap">
						<button type="button" class="btn btn--secondary" @click="addRow">
							{{ $t('text.transport_company_shipping_rates_add_interval') }}
						</button>
					</div>
				</div>
				<div class="shipping-rates-modal__api-error" v-if="apiErrorHtml" v-html="apiErrorHtml"></div>
				<div class="modal__inner modal__inner--center">
					<button type="button" @click="save" class="btn">{{ $t('text.transport_company_popup_save') }}</button>
				</div>
			</div>
			<div class="modal__content" v-else>
				<p class="shipping-rates-modal__error">{{ loadError }}</p>
			</div>
			<button class="modal__close" @click="close" :title="$t('text.transport_company_popup_close')"></button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { MainState } from '../../../../store/mainStore';
import transportCompaniesService from '../../../../services/transportCompaniesService';
import toaster from '../../../../utils/toaster';

export interface Props {
	show: boolean;
	companyId: string | number;
	shippingCostId: number | null;
}

const props = withDefaults(defineProps<Props>(), {
	show: false,
	companyId: '',
	shippingCostId: null,
});

const emit = defineEmits(['closePopup', 'saved']);

const localization = useI18n();
const store = useStore<MainState>();
const toast = inject('toast') as any;

const activeCls = ref('');
const overlayCls = ref('');
const rates = ref<{ minimum_order_value: number; maximum_order_value: number; value: number }[]>([
	{ minimum_order_value: 0, maximum_order_value: 1000, value: 0 },
]);
const courierDelivery = ref(false);
const postamats = ref(false);
const pickupPoints = ref(false);
const localError = ref('');
const loadError = ref('');
const apiErrorHtml = ref('');

const togglePopup = () => {
	if (props.show) {
		activeCls.value = 'modal--active';
		overlayCls.value = 'user-info__overlay--active';
	} else {
		activeCls.value = '';
		overlayCls.value = '';
	}
};

const parseNum = (v: unknown): number => {
	const n = Number(v);
	return Number.isFinite(n) ? n : NaN;
};

const ynToBool = (v: unknown): boolean =>
	v === 'Y' || v === true || v === 1 || v === '1';

const methodsFromApi = (raw: unknown): { courier: boolean; postamats: boolean; pickup: boolean } => {
	const set = new Set<string>();
	if (Array.isArray(raw)) {
		raw.forEach((x: string) => set.add(String(x)));
	}
	return {
		courier: set.has('courier_delivery'),
		postamats: set.has('postamats'),
		pickup: set.has('pickup_points'),
	};
};

/** API отдаёт rates как JSON-массив или как строку с JSON. */
const parseRatesPayload = (raw: unknown): unknown[] => {
	if (raw == null) return [];
	if (Array.isArray(raw)) return raw;
	if (typeof raw === 'string') {
		const trimmed = raw.trim();
		if (!trimmed) return [];
		try {
			const parsed = JSON.parse(trimmed) as unknown;
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}
	return [];
};

const supportFlagsFromApi = (data: Record<string, unknown>): { courier: boolean; postamats: boolean; pickup: boolean } => {
	const hasYn =
		'is_support_courier_delivery' in data ||
		'is_support_postamats' in data ||
		'is_support_pickup_points' in data;
	if (hasYn) {
		return {
			courier: ynToBool(data.is_support_courier_delivery),
			postamats: ynToBool(data.is_support_postamats),
			pickup: ynToBool(data.is_support_pickup_points),
		};
	}
	return methodsFromApi(data.shipping_methods);
};

const normalizeRates = (raw: unknown) => {
	const arr = parseRatesPayload(raw);
	if (arr.length === 0) {
		return [{ minimum_order_value: 0, maximum_order_value: 1000, value: 0 }];
	}
	return arr.map((r: any) => ({
		minimum_order_value: parseNum(r.minimum_order_value),
		maximum_order_value: parseNum(r.maximum_order_value),
		value: parseNum(r.value),
	}));
};

const loadData = async () => {
	loadError.value = '';
	apiErrorHtml.value = '';
	localError.value = '';
	if (props.shippingCostId == null) {
		loadError.value = localization.t('text.transport_company_shipping_rates_no_record');
		return;
	}
	store.commit('setLoading', true);
	const data = await transportCompaniesService.getShippingRates(
		localization,
		props.shippingCostId,
		errMsg => {
			loadError.value = errMsg;
		},
	);
	store.commit('setLoading', false);
	if (loadError.value) return;

	const d = data as Record<string, unknown>;
	const m = supportFlagsFromApi(d);
	courierDelivery.value = m.courier;
	postamats.value = m.postamats;
	pickupPoints.value = m.pickup;

	const nr = normalizeRates(d.rates);
	rates.value = nr.every(
		r => Number.isFinite(r.minimum_order_value) && Number.isFinite(r.maximum_order_value) && Number.isFinite(r.value),
	)
		? nr
		: [{ minimum_order_value: 0, maximum_order_value: 1000, value: 0 }];
};

const close = () => {
	emit('closePopup');
	activeCls.value = '';
	overlayCls.value = '';
};

const buildShippingMethods = (): string[] => {
	const out: string[] = [];
	if (courierDelivery.value) out.push('courier_delivery');
	if (postamats.value) out.push('postamats');
	if (pickupPoints.value) out.push('pickup_points');
	return out;
};

const validateFields = (): boolean => {
	for (const r of rates.value) {
		const min = parseNum(r.minimum_order_value);
		const max = parseNum(r.maximum_order_value);
		const val = parseNum(r.value);
		if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(val)) return false;
		if (min < 0) return false;
		if (max <= min) return false;
		if (val < 0) return false;
	}
	return true;
};

const validateNoGaps = (): boolean => {
	const sorted = [...rates.value]
		.map(r => ({
			minimum_order_value: parseNum(r.minimum_order_value),
			maximum_order_value: parseNum(r.maximum_order_value),
			value: parseNum(r.value),
		}))
		.sort((a, b) => a.minimum_order_value - b.minimum_order_value);

	for (let i = 1; i < sorted.length; i++) {
		const prev = sorted[i - 1];
		const cur = sorted[i];
		if (cur.minimum_order_value !== prev.maximum_order_value + 1) return false;
	}
	return true;
};

const addRow = () => {
	const sorted = [...rates.value].sort(
		(a, b) => parseNum(a.minimum_order_value) - parseNum(b.minimum_order_value),
	);
	const last = sorted[sorted.length - 1];
	const lastMax = last ? parseNum(last.maximum_order_value) : -1;
	const nextMin = lastMax + 1;
	rates.value.push({
		minimum_order_value: nextMin,
		maximum_order_value: nextMin + 1000,
		value: 0,
	});
};

const removeRow = (idx: number) => {
	if (rates.value.length <= 1) return;
	rates.value.splice(idx, 1);
};

const save = async () => {
	localError.value = '';
	apiErrorHtml.value = '';

	if (buildShippingMethods().length === 0) {
		localError.value = localization.t('text.transport_company_shipping_rates_methods_error');
		return;
	}
	if (!validateFields()) {
		localError.value = localization.t('text.transport_company_shipping_rates_field_error');
		return;
	}
	if (!validateNoGaps()) {
		localError.value = localization.t('text.transport_company_shipping_rates_gap_error');
		return;
	}
	if (props.shippingCostId == null) {
		localError.value = localization.t('text.transport_company_shipping_rates_no_record');
		return;
	}

	const payload = {
		transport_company_id: Number(props.companyId),
		shipping_methods: buildShippingMethods(),
		rates: rates.value.map(r => ({
			minimum_order_value: parseNum(r.minimum_order_value),
			maximum_order_value: parseNum(r.maximum_order_value),
			value: parseNum(r.value),
		})),
	};

	store.commit('setLoading', true);
	const response = await transportCompaniesService.updateShippingRates(
		localization,
		props.shippingCostId,
		payload,
		(errMsg, _code, type) => {
			if (type) {
				apiErrorHtml.value = errMsg;
			} else {
				apiErrorHtml.value = errMsg;
			}
		},
	);
	store.commit('setLoading', false);

	if ((response as any)?.message === 'success') {
		toaster.success(toast, localization.t('text.generalSuccessUpdated'));
		emit('saved');
		close();
	}
};

watch(
	() => props.show,
	async visible => {
		togglePopup();
		if (visible) {
			await loadData();
		}
	},
);
</script>

<style lang="scss">
.shipping-rates-modal__wrapper {
	max-width: min(960px, 96vw) !important;
	width: 100%;
}

.shipping-rates-modal__methods {
	margin-bottom: 16px;
}

.shipping-rates-modal__methods-intro {
	margin: 0 0 12px;
	font-size: 14px;
	line-height: 1.4;
}

.shipping-rates-modal__methods-col {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 0;
}

.shipping-rates-modal__rates-block {
	margin-bottom: 12px;
}

.shipping-rates-modal__table-scroll {
	max-height: min(50vh, 360px);
	overflow-y: auto;
	overflow-x: auto;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 4px;
}

.shipping-rates-modal__add-wrap {
	padding-top: 10px;
}

.shipping-rates-modal__table {
	width: 100%;
	border-collapse: collapse;
	font-size: 14px;

	th,
	td {
		padding: 8px;
		text-align: center;
		vertical-align: middle;
	}

	th {
		font-weight: 600;
	}

	.shipping-rates-modal__input {
		width: 100%;
		min-width: 110px;
	}
}

.shipping-rates-modal__th-actions {
	width: 44px;
}

.shipping-rates-modal__actions-cell {
	width: 44px;
	text-align: center;
	vertical-align: middle;
	padding-left: 4px;
	padding-right: 4px;
}

.shipping-rates-modal__remove {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	margin: 0;
	padding: 0;
	border: none;
	background: transparent;
	cursor: pointer;
	color: #666;
	border-radius: 4px;
	line-height: 0;
	flex-shrink: 0;
}

.shipping-rates-modal__remove:hover {
	color: #c00;
	background: rgba(0, 0, 0, 0.06);
}

.shipping-rates-modal__remove-icon {
	display: block;
}

.shipping-rates-modal__error {
	color: #c00;
	margin-bottom: 12px;
}

.shipping-rates-modal__api-error {
	color: #c00;
	margin: 12px 0;
	text-align: center;
}

/* Переопределение глобальных стилей модалки (_modal.sass) только для этого окна */
.shipping-rates-modal.modal .modal__wrapper--long .btn {
	margin-top: 16px;
}

.shipping-rates-modal.modal .modal__content .checkbox-group + .checkbox-group {
	margin-top: 10px;
}
</style>
