<template>
	<div class="modal" :class="activeCls">
		<div class="modal__wrapper">
			<div class="modal__top">
				<h2 class="modal__title" v-if="isAnalog">{{ $t('text.selection_analogues') }}</h2>
				<h2 class="modal__title" v-else>{{ $t('text.selection_related_products') }}</h2>
			</div>
			<div class="modal__content overflow-hidden">
				<input
					type="text"
					class="modal__input input"
					:placeholder="$t('text.find_product')"
					v-model="queryString"
					@input="search" />
				<template v-if="fetchedProducts?.length">
					<h3 class="modal__subtitle">{{ $t('text.suitable_products') }}</h3>
					<div class="modal__list">
						<div :key="product.id" class="modal__item" v-for="product in fetchedProducts">
							<a
								href=""
								class="modal__link"
								@click.prevent="addProduct(product)"
								v-html="`${product.vendor_code} ${product.name}`"></a>
							<button class="modal__delete" title="Удалить">Удалить</button>
						</div>
					</div>
				</template>
				<template v-if="products?.length">
					<h3 class="modal__subtitle" style="margin-bottom: 4px;">{{ isAnalog ? $t('text.selected_analogues') : $t('text.selected_related') }}</h3>
					<div :style="[isAnalog ? {} : {'overflow': 'scroll', 'height': '108px', 'overflow-x': 'hidden'}]">
						<div :key="product.id" class="modal__item overflow-hidden" v-for="product in products">
							<div @click.prevent="() => {}" class="selected-product" v-html="`<b>Продукт</b>: ` + `<span title='${product.name}'>${product.name}</span>`+`<br><b>Артикул</b>: `+`${product.vendor_code}`"></div>
							<button class="modal__delete" :title="$t('text.remove')" @click="removeSelectedProduct(product.id)" style="margin-top: 2px;">
								{{ $t('text.remove') }}
							</button>
						</div>
					</div>
				</template>
				<div class="modal__checkbox" v-if="isAnalog">
					<label class="checkbox-group">
						<input type="checkbox" class="checkbox-group__checkbox" v-model="isAnalogModel" />
						<span>{{ $t('text.load_from_analog') }}</span>
					</label>
				</div>
				<div class="modal__inner modal__inner--center">
					<button class="btn" @click="saveProducts">{{ $t('text.complete_and_add') }}</button>
				</div>
				<button class="modal__close" :title="$t('text.close')" @click="onClose">{{ $t('text.close') }}</button>
			</div>
		</div>
	</div>
	<div class="modal-overlay" :class="overlayCls"></div>
</template>

<script lang="ts">
import { useStore } from 'vuex';
import { MainState } from '../../../../store/mainStore';
import { ref, watch, inject } from 'vue';
import { computed, onMounted } from '@vue/runtime-core';
import productsService from '../../../../services/productsService';
import toaster from '../../../../utils/toaster';
import sleep from '../../../../utils/sleep';

export default {
	props: {
		show: {
			type: Boolean,
			required: true,
		},
		isAnalog: {
			type: Boolean,
			required: true,
			default: false,
		},
		productTypeId: {
			type: Number,
			default: null,
		},
		selectedProductId: {
			type: Number,
			default: null,
		},
	},
	emits: ['addProducts', 'toggleProductDataCopy', 'closeModal', 'setCurrentAnalogData'],
	setup(props, { emit }) {
		const activeCls = ref('');
		const overlayCls = ref('');
		const queryString = ref('');
		const fetchedProducts = ref();
		const products = ref<any>([]);
		const toast = inject('toast');
		const store = useStore<MainState>();
		const toggleDialog = show => {
			if (show) {
				activeCls.value = 'modal--active';
				overlayCls.value = 'modal-overlay--active';
			} else {
				activeCls.value = '';
				overlayCls.value = '';
				isAnalogModel.value = false;
			}
		};

		const removeSelectedProduct = id => {
			products.value = products.value.filter(product => product.id !== id);
		};
		const sendingString = computed(() =>
			queryString.value + props.productTypeId ? `&filters[product_group]=${props.productTypeId}` : '',
		);
		const search = async () => {
			const str = queryString.value + props.productTypeId ? `&filters[product_group]=${props.productTypeId}` : '';
			store.commit('setLoading', true);
			fetchedProducts.value = await productsService.getRelatedProductOrAnalog(
				'localization',
				1,
				queryString.value,
				props.isAnalog ? props.productTypeId : '',
				errMsg => console.error(errMsg),
			);
			store.commit('setLoading', false);
		};

		const addProduct = async (product: any) => {
			props.selectedProductId = product.id;
			//await sleep(1);
			store.commit('setLoading', true);

			const fetchedAnalogs: any = props.isAnalog
				? await productsService.getSimilar('localization', { products: [product.id] }, errMsg => console.error(errMsg))
				: await productsService.getAll('localization', errMsg => console.error(errMsg));

			//product.fetched_analog = fetchedAnalogs[product.id];
			
			fetchedProducts.value = fetchedProducts.value.filter(p => product.id !== p.id);
			
			if (props.isAnalog) {
				products.value = [];
				products.value.push(product);
			} else {
				products.value.push(product);
			}
			
			store.commit('setLoading', false);
		};

		const isAnalogModel = ref(false);
		const saveProducts = async () => {

			if(props.isAnalog) {
				store.commit('setLoading', true);
				await productsService.setSimilar('localization', store.state.activeProductId, props.selectedProductId, errMsg => console.error(errMsg));
				//const fetchedAnalogs: any = await productsService.getSimilar('localization', { products: [store.state.activeProductId] }, errMsg => console.error(errMsg));
				store.commit('setLoading', false);
			}
			
			if (isAnalogModel.value && products.value.length) {
				emit('setCurrentAnalogData', products.value);
				emit('toggleProductDataCopy', 'from_analog');
			}
			emit('addProducts', products.value);
			emit('closeModal');
			toggleDialog(false);
		};

		const onClose = () => {
			emit('closeModal');
			toggleDialog(false);
		};

		watch(
			() => props.show,
			() => {
				queryString.value = '';
				fetchedProducts.value = [];
				products.value = [];
				toggleDialog(props.show);
			},
		);
		onMounted(() => {
			isAnalogModel.value = false;
		});

		return {
			activeCls,
			isAnalogModel,
			overlayCls,
			fetchedProducts,
			products,
			queryString,
			addProduct,
			saveProducts,
			onClose,
			removeSelectedProduct,
			search,
		};
	},
};
</script>

<style scoped>
.selected-product {
	max-width: 90%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
