import { inject, ref } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { MainState } from '../../../store/mainStore';
import toaster from '../../../utils/toaster';
import { ApiProductService, ApiServiceWithImageSaving } from '../../../types/service';
import productsService from '../../../services/productsService';
export default function useImageHandler(service: ApiServiceWithImageSaving | ApiProductService, appendString: string) {
	const localization: any = useI18n();
	const toast = inject('toast') as any;
	const store = useStore<MainState>();
	const previewImage: any = ref();
	let imageData: any = null;

	const makeImagePreview = (e: any) => {
		const image = e.target.files[0];
		const reader = new FileReader();
		const tmpFile = reader.readAsDataURL(image);

		reader.onload = e => {
			previewImage.value = e.target?.result;
		};
		const formData = new FormData();
		formData.append(appendString, image);
		imageData = formData;
	};

	const saveImage = async (id: string | number, evt = null) => {
		if (evt) {
			makeImagePreview(evt)
		}
		if (imageData !== null) {
			store.commit('setLoading', true);
			const response = await service.saveImage(localization, id, imageData, errMsg => {
				toaster.error(toast, errMsg);
			});
			store.commit('setLoading', false);
			return response;
		}
		return false;
	};
	const productPhotos = ref<Array<File>>([]);
	const imageLoading = ref<Number[]>([]);
	const uploadImages = async (guid, productId) => {

		let order = 1
		if (productId) {
			const product = await productsService.get(localization, productId, errMsg => toaster.error(toast, errMsg))

			if (product.photos.length) {
				order = productPhotos.value.length + 1;
			}
		}


		let productPhotosLength = 0
		for await (const productPhoto of productPhotos.value) {
			productPhotosLength++
			const formData = new FormData();
			formData.append('photo', productPhoto);
			if ('saveImageWithOrder' in service) {
				const response = await service.saveImageWithOrder(
					localization,
					guid,
					order.toString(),
					formData,
					errMsg => toaster.error(toast, errMsg),
					(progressEvent) => {
						imageLoading.value[productPhotosLength] = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100)
							.toString());
					},
				);
			}
			order++
		}
		productPhotos.value = []
		return true
	};

	return {
		productPhotos,
		imageLoading,
		previewImage,
		makeImagePreview,
		saveImage,
		uploadImages,
	};
}
