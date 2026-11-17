<template>
	<AppPage :title="isEditMode ? $t('text.header_edit') : $t('text.header')" :canEdit="canEdit" v-if="canEdit">
		<div class="main__content">
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.method_name') }}</span>
				<input
					type="text"
					v-model="name"
					class="main__input input"
					:placeholder="$t('text.method_name_placeholder')"
					@input="removeError(errors?.errors['names.0.value'])" />
				<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['names.0.value']" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.comment') }}</span>
				<input
					type="text"
					v-model="additionalComment"
					class="main__input input"
					:placeholder="$t('text.comment_placeholder')"
					@input="removeError(errors?.errors['additional_comments.0.value'])" />
				<span
					v-if="errors?.errors"
					class="main__error main__error-message"
					v-html="errors?.errors['additional_comments.0.value']" />
			</div>
			<div class="main__inner main__inner--short">
				<span class="main__text">Code</span>
				<input
					type="text"
					v-model="code"
					class="main__input input"
					:placeholder="$t('text.code_placeholder')"
					@input="removeError(errors?.errors['code'])" />
				<span v-if="errors?.errors" class="main__error main__error-message" v-html="errors?.errors['code']" />
			</div>
			<!-- Мин макс сумма заказа -->
			<div class="main__inner main__inner--short">
				<span class="main__text">{{ $t('text.max_min_order_sum') }}</span>
				<div class="main__block">
					<div class="main__help">{{ $t('text.from_') }}</div>
					<input
						type="text"
						v-model="minimumOrderValue"
						class="main__input input"
						:placeholder="$t('text.min_placeholder')"
						@input="removeError(errors?.errors['minimum_order_value'][0])" />
					<div class="main__help">&nbsp;{{ $t('text.to') }}</div>
					<input
						type="text"
						v-model="maximumOrderValue"
						class="main__input input"
						:placeholder="$t('text.max_placeholder')"
						@input="removeError(errors?.errors['maximum_order_value'][0])" />
				</div>
				<span v-if="errors?.errors" class="main__error min_order_sum" v-html="errors?.errors['minimum_order_value'][0]" />
				<span v-if="errors?.errors" class="main__error max_order_sum" v-html="errors?.errors['maximum_order_value'][0]" />
			</div>
			<div class="main__inner main__inner--short"></div>
			<!-- Client Types  -->
			<div class="main__inner main__inner--short mt-25">
				<span class="main__text">{{ $t('text.client_types') }}</span>
				<div class="main__block">
					<div class="main__group">
						<label :key="clientType.id" class="checkbox-group" v-for="clientType in clientTypes">
							<input type="checkbox" v-model="clientType.checked" class="checkbox-group__checkbox" />
							<span>{{ clientType.name }}</span>
						</label>
					</div>
				</div>
			</div>
			<!-- Transport companies -->
			<div class="main__inner main__inner--short main__inner--top">
				<span class="main__text">{{ $t('text.for_tk') }}</span>
				<div class="main__block">
					<div class="main__column main__column--ultra">
						<div :key="tk.id" class="main__group" v-for="tk in transportCompanies">
							<span class="main__help main__help--bold">{{ tk.name }}</span>
							<div class="main__group">
								<label class="checkbox-group">
									<input type="checkbox" v-model="tk.is_support_courier_delivery" class="checkbox-group__checkbox" />
									<span>{{ $t('text.courier') }}</span>
								</label>
								<label class="checkbox-group">
									<input type="checkbox" v-model="tk.is_support_pickup_points" class="checkbox-group__checkbox" />
									<span>{{ $t('text.pvz') }}</span>
								</label>
								<label class="checkbox-group">
									<input type="checkbox" v-model="tk.is_support_postamats" class="checkbox-group__checkbox" />
									<span>{{ $t('text.postomats') }}</span>
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- Подразделы каталога для которых метод оплаты недоступен -->
			<div class="main__bottom">
				<h3 class="main__title mb-15">{{ $t('text.not_available_subsection') }}</h3>

				<ul class="not-participated-category">
					<li v-if="!notParticipatingSections.length" class="mb-10">Нет выбранных подразделов</li>
					<li else class="not-participated-category__item" :key="section.id" v-for="section in notParticipatingSections">
						<a href="#" @click="removeSection(section.id)" class="not-participated-category__link">{{ section?.name }}</a>
					</li>
				</ul>
				<!-- Add subsection btn -->
				<button class="main__btn main__btn--add modal-btn" @click="showCatalogSectionsModal">
					{{ $t('text.add_subsection') }}
				</button>
				<div class="main__inner main__inner--end">
					<label for="type-checkbox" class="checkbox-group">
						<span>{{ $t('text.activate_method') }}</span>
						<input type="checkbox" v-model="isActive" id="type-checkbox" class="checkbox-group__checkbox" />
					</label>
				</div>
				<div class="main__inner main__inner--end">
					<button v-if="isEditMode" class="btn" @click="saveOrUpdate('update')">{{ $t('text.update') }}</button>
					<button v-else class="btn" @click="saveOrUpdate('save')">{{ $t('text.add') }}</button>
				</div>
			</div>
		</div>
		<catalog-sections-modal
			:is-visible="isCatalogSectionsModalVisible"
			:catalogSections="catalogSections"
			:product-types="productTypes"
			@update="updateNotParticipatingSections"
			@close="isCatalogSectionsModalVisible = false"></catalog-sections-modal>
	</AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { inject, ref, watch, onBeforeMount } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import usePageInit from '../../../composables/pages/dashboard/usePageInit';
import useValidationHandler from '../../../composables/pages/dashboard/useValidationHandler';
import useCreateOrUpdate from '../../../composables/pages/dashboard/useCreateOrUpdate';
import paymentMethodsService from '../../../services/paymentMethodsService';
import clientTypesService from '../../../services/clientTypesService';
import transportCompaniesService from '../../../services/transportCompaniesService';
import CatalogSectionsModal from '../../_components/dashboard/CatalogSectionsModal.vue';
import catalogSectionsService from '../../../services/catalogSectionsService';
import productTypesService from '../../../services/productTypesService';
import sleep from '../../../utils/sleep';
import redirect from '../../../utils/redirect';
const store = useStore<MainState>();
const toast = inject('toast') as any;
const localization: any = useI18n();

const errorNames = [
	'additional_comments.0.value',
	'additional_comments',
	'code',
	'is_active',
	'maximum_order_value',
	'minimum_order_value',
	'names.0.value',
];

let isClicked = false;

const { validate, errors, removeError } = useValidationHandler();

const name = ref();
const additionalComment = ref();
const code = ref();
const minimumOrderValue = ref();
const maximumOrderValue = ref();
const isActive = ref();
const clientTypes = ref();
const transportCompanies = ref();
const isCatalogSectionsModalVisible = ref(false);
const catalogSections = ref();
const productTypes = ref();
const order = ref(9999);
const { canEdit, canView, itemId, isEditMode } = usePageInit('paymentmethods');

const sendData = computed(() => ({
	names: [
		{
			lang: localization.locale.value,
			value: name.value,
		},
	],
	additional_comments: [
		{
			lang: localization.locale.value,
			value: additionalComment.value,
		},
	],
	code: code.value,
	order: order.value,
	minimum_order_value: minimumOrderValue.value,
	maximum_order_value: maximumOrderValue.value,
	is_active: isActive.value ? 'Y' : 'N',
	client_types: clientTypes.value.filter(ct => ct.checked).map(ct => ct.id),
	transport_companies: transportCompanies.value.map(tk => ({
		transport_company_id: tk.transport_company_id,
		is_support_courier_delivery: tk.is_support_courier_delivery ? 'Y' : 'N',
		is_support_postamats: tk.is_support_postamats ? 'Y' : 'N',
		is_support_pickup_points: tk.is_support_pickup_points ? 'Y' : 'N',
	})),
}));

const { create, update } = useCreateOrUpdate(paymentMethodsService, errorNames, '/dashboard/payment-methods');
const saveOrUpdate = async selector => {
	isClicked = true;
	if (validate(isClicked, sendData.value)) {
		let response;
		// eslint-disable-next-line no-unused-expressions
		if (selector === 'save') {
			response = await create(sendData.value);
			await paymentMethodsService.setBlockedSections(
				localization,
				response.payment_method_id,
				notParticipatingSections.value.map(item => item.id)?.length
					? { sections: notParticipatingSections.value?.map(item => item.id) }
					: [],
				errMsg => toaster.error(toast, errMsg),
			);
		} else {
			await update(itemId.value, sendData.value);
			await paymentMethodsService.setBlockedSections(
				localization,
				paymentMethodId.value,
				notParticipatingSections.value.map(item => item.id)?.length
					? { sections: notParticipatingSections.value?.map(item => item.id) }
					: [],
				errMsg => toaster.error(toast, errMsg),
			);
		}
	}
};

const notParticipatingSections = ref<any>([]);
const showCatalogSectionsModal = () => {
	isCatalogSectionsModalVisible.value = true;
};

const updateNotParticipatingSections = async sectionIds => {
	notParticipatingSections.value = [];
	catalogSections.value.forEach(section => {
		section.checked = false;
		sectionIds.forEach(id => {
			if (id === section.id) {
				section.checked = true;
				notParticipatingSections.value.push({
					id: section.id,
					name: section.name,
				});
			}
		});
	});
};

const removeSection = id => {
	notParticipatingSections.value = notParticipatingSections.value.filter(section => section.id !== id);
	catalogSections.value.forEach(section => {
		section.checked = false;
		notParticipatingSections.value.forEach(notParticipatingSection => {
			if (notParticipatingSection.id === section.id) {
				section.checked = true;
			}
		});
	});
};

const setNotParticipatingSections = () => {
	if (JSON.stringify(fetchedBlockedSections.value) !== '{}') {
		catalogSections.value?.forEach(section => {
			section.checked = false;
			fetchedBlockedSections.value.forEach(fetchedSection => {
				if (fetchedSection.section_id === section.id) {
					section.checked = true;
					notParticipatingSections.value.push({
						id: section.id,
						name: section.name,
					});
				}
			});
		});
	}
};
const fetchedBlockedSections = ref();
const paymentMethodId = ref();
onBeforeMount(async () => {
	if (!canEdit.value) redirect('/dashboard/payment-methods');
	const urlParams = new URLSearchParams(window.location.search);
	itemId.value = urlParams.get('edit');
	isEditMode.value = !!itemId.value;
	document.title += isEditMode.value ? ' - ' + localization.t('text.header_edit') : ' - ' + localization.t('text.header');
	let fetchedClientTypes;
	let fetchedTransportCompanies;
	let paymentMethod;
	await sleep(1);
	store.commit('setLoading', true);
	Promise.all([
		clientTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		transportCompaniesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		catalogSectionsService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		productTypesService.getAll(localization, errMsg => toaster.error(toast, errMsg)),
		isEditMode.value ? paymentMethodsService.get(localization, itemId.value, errMsg => toaster.error(toast, errMsg)) : [],
		isEditMode.value
			? paymentMethodsService.getBlockedSections(localization, itemId.value, errMsg => toaster.error(toast, errMsg))
			: [],
	])
		.then(
			values =>
				([
					fetchedClientTypes,
					fetchedTransportCompanies,
					catalogSections.value,
					productTypes.value,
					paymentMethod,
					fetchedBlockedSections.value,
				] = [...values]),
		)
		.then(() => {
			transportCompanies.value = fetchedTransportCompanies.map(tk => ({
				name: tk.name,
				transport_company_id: tk.id,
				is_support_courier_delivery: false,
				is_support_postamats: false,
				is_support_pickup_points: false,
			}));
			clientTypes.value = fetchedClientTypes.map(ct => ({
				name: ct.name,
				id: ct.id,
				checked: false,
			}));
			if (isEditMode.value) {
				paymentMethodId.value = paymentMethod[0]?.id;
				name.value = paymentMethod[0]?.name;
				additionalComment.value = paymentMethod[0]?.additional_comment;
				code.value = paymentMethod[0]?.code;
				order.value = paymentMethod[0]?.order;
				minimumOrderValue.value = paymentMethod[0]?.minimum_order_value;
				maximumOrderValue.value = paymentMethod[0]?.maximum_order_value;
				isActive.value = paymentMethod[0]?.is_active === 'Y';
				clientTypes.value = clientTypes.value.map((ct, idx) => ({
					name: ct.name,
					id: ct.id,
					checked: !!paymentMethod[0]?.client_types.filter(clientType => clientType.pivot.client_type_id == ct.id).length,
				}));
				transportCompanies.value = transportCompanies.value?.map((tk, idx) => ({
					name: tk.name,
					transport_company_id: tk.transport_company_id,
					is_support_courier_delivery:
						paymentMethod[0]?.transport_companies?.filter(t_k => t_k.id === tk.transport_company_id)[0]?.pivot
							.is_support_courier_delivery === 'Y',
					is_support_postamats:
						paymentMethod[0]?.transport_companies?.filter(t_k => t_k.id === tk.transport_company_id)[0]?.pivot
							.is_support_postamats === 'Y',
					is_support_pickup_points:
						paymentMethod[0]?.transport_companies?.filter(t_k => t_k.id === tk.transport_company_id)[0]?.pivot
							.is_support_pickup_points === 'Y',
				}));
				setNotParticipatingSections();
			}
		})
		.then(() => store.commit('setLoading', false));
});
</script>
