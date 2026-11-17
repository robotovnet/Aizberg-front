import { ref } from 'vue';

export default function useAnalogsOrRelatedProducts() {
	const relatedProducts = ref<any>([]);
	const analogs = ref<any>([]);

	const addRelatedProducts = (products) => {
		products.forEach(product => {
			relatedProducts.value.push(product);
		});
	};

	const addAnalogs = (products) => {
		products.forEach(product => {
			analogs.value.push(product);
		});
	};

	const isAnalog = ref(false);

	const isAddAnalogModalVisible = ref(false);
	const showAddAnalogModal = () => {
		isAnalog.value = true;
		isAddAnalogModalVisible.value = !isAddAnalogModalVisible.value;
	};

	const isAddRelatedProductVisible = ref(false);
	const showAddRelatedProductModal = () => {
		isAnalog.value = false;
		isAddRelatedProductVisible.value = !isAddRelatedProductVisible.value;
	};

	return {
		analogs,
		isAnalog,
		isAddAnalogModalVisible,
		isAddRelatedProductVisible,
		relatedProducts,
		addAnalogs,
		addRelatedProducts,
		showAddAnalogModal,
		showAddRelatedProductModal,
	};
}
