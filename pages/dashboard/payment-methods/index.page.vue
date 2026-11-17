<template>
	<AppPage
		:button-text="$t('text.add_button')"
		:title="$t('text.header')"
		:handler="() => redirect('/dashboard/payment-methods/item')"
		:canEdit="canEdit"
		v-if="canView">
		<div class="list list--three list--photo list--background">
			<div class="list__topping">
				<div class="list__heading" style="max-width: 60px;">{{ $t('text.order') }}</div>
				<span class="list__heading">{{ $t('text.methods') }}</span>
				<span class="list__heading">{{ $t('text.is_active') }}</span>
				<span class="list__heading">{{ $t('text.remove') }}</span>
			</div>
			<template :key="paymentMethod.id" v-for="(paymentMethod, index) in paymentMethods">
				<div>
					<div class="list__item">
						<div class="list__elem" style='max-width: 60px;'>
							<select 
								@change="updateOrderPaymentMethods(paymentMethod, $event, null)"
								class="main__select select">
								<option v-for="(, indx) in paymentMethods" 
									:selected="(indx+1)==paymentMethod.order"
									:value="(indx + 1)">{{ (indx + 1) }}</option>
							</select>
							<div style='text-align: center; margin-top: 8px;'>
								<span @click="updateOrderPaymentMethods(paymentMethod, $event, index)" style='cursor: pointer; padding: 5px; display: inline-block;'><img src='../../../assets/img/arrow_order.svg' :alt="$t('text.parameter_up')" :title="$t('text.parameter_up')" style='transform:rotate(180deg);' /></span>
								<span @click="updateOrderPaymentMethods(paymentMethod, $event, index+2)" style='cursor: pointer; padding: 5px; display: inline-block;'><img src='../../../assets/img/arrow_order.svg' :alt="$t('text.parameter_down')" :title="$t('text.parameter_down')" style='margin-left: 6px;' /></span>
							</div>
						</div>
						<div class="list__elem">
							<button
								:disabled="!canEdit"
								class="list__edit"
								:title="$t('text.edit')"
								@click="redirect(`/dashboard/payment-methods/item?edit=${paymentMethod.id}`)"></button>
							<span>{{ paymentMethod.name }}</span>
						</div>
						<span class="list__elem">
							<button
								:disabled="!canEdit"
								@click="toggleOnOff(paymentMethod.id)"
								class="dot"
								:class="{ 'dot--red': paymentMethod?.is_active === 'N', 'dot--green': paymentMethod?.is_active === 'Y' }"
								:title="paymentMethod?.is_active === 'N' ? $t('text.turn_on') : $t('text.turn_off')"></button>
						</span>
						<span class="list__elem">
							<button
								:disabled="!canEdit"
								class="cross"
								@click="onConfirmDelete(paymentMethod?.id, paymentMethod?.name)"
								:title="$t('text.remove')"></button>
						</span>
					</div>
				</div>
			</template>
		</div>
		<AskDialog
			:deleteId="itemId?.toString()"
			:title="$t('text.dialog_delete_title')"
			:question="$t('text.dialog_delete_question') + '&quot;' + itemName + '&quot;' + '?'"
			:onConfirm="onDelete" />
	</AppPage>
</template>

<script setup lang="ts">
import { inject, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { onMounted } from '@vue/runtime-core';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import clientTypesService from '../../../services/clientTypesService';
import transportCompaniesService from '../../../services/transportCompaniesService';
import toaster from '../../../utils/toaster';
import AskDialog from '../../_components/AskDialog.vue';
import useDeleteHandler from '../../../composables/pages/dashboard/useDeleteHandler';
import paymentMethodsService from '../../../services/paymentMethodsService';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
const toast = inject('toast') as any;
const localization: any = useI18n();
const store = useStore<MainState>();

const { canEdit, canView } = usePageInit('paymentmethods');

const paymentMethods = ref();
onBeforeMount(async () => {
	if (!canView.value) redirect('/dashboard');
	await sleep(1);
	store.commit('setLoading', true);
	paymentMethods.value = await paymentMethodsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
	paymentMethods.value.sortAscendantByField('order');
});

const sort = async () => {
	const sortData = paymentMethods.value.map(paymentMethod => ({
		pmId: paymentMethod.id,
		order: paymentMethod.order,
	}));
	store.commit('setLoading', true);
	await paymentMethodsService.setOrder(localization, { orders: sortData }, errMsg => toaster.error(toast, errMsg));
	store.commit('setLoading', false);
};

const updateOrderPaymentMethods = async (payment_method_item, event, pos) => {
	if (canEdit.value) {
		const totalItems = paymentMethods.value.length;
		const tempArr = paymentMethods.value.filter(payment_method => payment_method.id !== payment_method_item.id);
		
		if (pos == null) {
			tempArr.splice(event.target.value - 1, 0, payment_method_item);
		} else {
			if (pos == 0) {
				pos = totalItems;
			}
	
			if (pos > totalItems) {
				pos = 1;
			}
	
			tempArr.splice(pos - 1, 0, payment_method_item);
		}
	
		tempArr.forEach((item, index) => (item.order = (index + 1).toString()));
		paymentMethods.value = tempArr;
		
		await sort();
	}
};
	
const sendData = ref();
const toggleOnOff = async paymentMethodId => {
	store.commit('setLoading', true);
	const fetchedPaymentMethod: any = await paymentMethodsService.get(localization, paymentMethodId, errMsg =>
		toaster.error(toast, errMsg),
	);
	const paymentMethod = fetchedPaymentMethod[0];
	sendData.value = {
		names: [
			{
				lang: localization.locale.value,
				value: paymentMethod.name,
			},
		],
		additional_comments: [
			{
				lang: localization.locale.value,
				value: paymentMethod.additional_comment,
			},
		],
		code: paymentMethod.code,
		order: paymentMethod.order,
		minimum_order_value: paymentMethod.minimum_order_value,
		maximum_order_value: paymentMethod.maximum_order_value,
		is_active: paymentMethod.is_active === 'Y' ? 'N' : 'Y',
		client_types: paymentMethod.client_types.map(ct => ct.pivot.client_type_id),
		transport_companies: paymentMethod.transport_companies.map(tk => {
			return {
				transport_company_id: tk.pivot.transport_company_id,
				is_support_courier_delivery: tk.pivot.is_support_courier_delivery,
				is_support_postamats: tk.pivot.is_support_postamats,
				is_support_pickup_points: tk.pivot.is_support_pickup_points,
			};
		}),
	};
	await paymentMethodsService.update(localization, paymentMethodId, sendData.value, [], errMsg => {
		toaster.error(toast, errMsg);
	});
	paymentMethods.value = await paymentMethodsService.getAll(localization, errMsg => toaster.error(toast, errMsg));
	paymentMethods.value.sortAscendantByField('order');
	store.commit('setLoading', false);
};

const { marker, itemId, itemName, onDelete, onConfirmDelete } = useDeleteHandler(paymentMethodsService);
watch(
	() => marker.value,
	async () => (paymentMethods.value = await paymentMethodsService.getAll(localization, errMsg => toaster.error(toast, errMsg))),
);

onMounted(() => {
	document.title += ` - ${localization.t('text.title')}`;
});
</script>

<style>
.list--three.list--photo .list__elem:nth-child(2) {
	max-width: 100%;
}
</style>
