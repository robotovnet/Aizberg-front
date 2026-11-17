import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export default function useOrdersData() {
	const localization: any = useI18n();
	const orderStatuses = ref([
		{
			name: 'Новый',
			value: 'new',
		},
		{
			name: 'В работе',
			value: 'confirm',
		},
		{
			name: 'Передан ТК',
			value: 'delivered',
		},
		{
			name: 'Готов к выдаче',
			value: 'ready',
		},
		{
			name: 'Не прошел в 1с',
			value: '1c_err',
		},
		{
			name: 'Возврат',
			value: 'return',
		},
		{
			name: 'Отменен',
			value: 'cancel',
		},
		{
			name: 'Дубль',
			value: 'duplicate',
		},
		{
			name: 'Недозвон',
			value: 'non_call',
		},
		{
			name: 'Завершен',
			value: 'complete',
		},
	]);
	const deliveryPointTypes = ref([
		{
			name: 'Пункт выдачи',
			value: 'pickup',
		},
		{
			name: 'Курьер',
			value: 'courier_city',
		},
		{
			name: 'Постамат',
			value: 'postamat',
		},
	]);
	const paymentStatuses = ref([
		{
			name: 'Ожидается платеж',
			value: 'waiting',
		},
		{
			name: 'Оплачено',
			value: 'paid',
		},
		{
			name: 'Ошибка оплаты',
			value: 'error',
		},
		{
			name: 'Отменен клиентом',
			value: 'canceled',
		},
		{
			name: 'Отменен по тайм-ауту',
			value: 'cancelled_by_timeout',
		},
	]);
	const deliveryMethodsName = (tk) => {
		let phrase = tk?.is_support_courier_delivery === 'Y' ? localization.t('text.courier') : '';
		phrase += tk?.is_support_postamats === 'Y' ? `${tk.is_support_courier_delivery === 'Y' ? ', ' : ''}${localization.t('text.postamat')}` : '';
		phrase += tk?.is_support_pickup_points === 'Y' ? `${tk.is_support_postamats === 'Y' ? ', ' : ''}${localization.t('text.pvz')}` : '';
		return phrase;
	};
	return {
		orderStatuses,
		deliveryPointTypes,
		paymentStatuses,
		deliveryMethodsName,
	};
}
