import fetchApi from '../network/fetchEndpoint';
import axios from '../network/axios';

const toNumber = (data) => {
	if (Number.isFinite(data)) return data;
	if (typeof data === 'string' || data instanceof String) return parseInt(data as string, 10);
	return undefined;
};

const processErrBlob = (localization: any, status: number | undefined, err: string) => ((!status && typeof window !== 'undefined' && window.navigator.onLine) ? localization.t('text.unknownError')
	: (!status && typeof window !== 'undefined' && !window.navigator.onLine) ? localization.t('text.offlineError') : err);

function parseContentDispositionFilename(header?: string): string | null {
	if (!header) return null;
	const utf8 = /filename\*=UTF-8''([^;\n]+)/i.exec(header);
	if (utf8?.[1]) {
		try {
			return decodeURIComponent(utf8[1].trim());
		} catch {
			return utf8[1].trim();
		}
	}
	const simple = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i.exec(header);
	if (simple?.[1]) {
		return simple[1].replace(/^['"]|['"]$/g, '').trim();
	}
	return null;
}

const productsService = {
	async getAll(localization, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.get('catalog/products/all'));
	},

	async getAllWithPagination(localization, page, onPage, catalogSectionId, filterString, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.get(`catalog/products/all?page=${page}&section_id=${catalogSectionId}&${filterString}`));
	},

	async get(localization, id, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.get(`catalog/products/${id}`));
	},

	async total(localization, sectionId, filterString, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.get(`catalog/products/total/${sectionId}?${filterString}`));
	},

	async toggleVisibilityOfProduct(localization, pid, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.get(`catalog/products/toggle_visibility/${pid}`));
	},

	async getRelatedProductOrAnalog(localization, page, queryString, id = 0, onError = () => {
	}) {
		const str = `catalog/products/all?page=${page}&search=${queryString}${id ? `&filters[product_group]=${id}` : ''}`;
		console.log(str);
		return await fetchApi(localization, onError, axios => axios.get(str));
	},

	async getSimilar(localization, data, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.post('catalog/products/similar', data), ['products']);
	},

	async setSimilar(localization, productId, analogId, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.get(`catalog/products/similar/add/${productId}/${analogId}`));
	},

	async deleteSimilar(localization, productId, analogId, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.get(`catalog/products/similar/delete/${productId}/${analogId}`));
	},

	async create(localization, data, errorNames, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.post('catalog/products/store', data), errorNames);
	},

	async changeImageOrder(localization, data, errorNames, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.post('catalog/products/photos/order', data), errorNames);
	},

	async saveImageWithOrder(
		localization,
		guid,
		order,
		imageData,
		onError = () => {
		},
		loader = (progressEvent) => progressEvent,
	) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post(
				`catalog/products/photo/${guid}/${order}/${order === '1' ? 'main' : ''}`,
				imageData, {headers: {'Content-Type': 'multipart/form-data'}},
				{
					onUploadProgress(progressEvent) {
						loader(progressEvent);
					},
				},
			),
			['photo'],
		);
	},

	async saveImage(localization, id, imageData, onError = () => {
	}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('catalog/products/ad/photo', imageData, {headers: {'Content-Type': 'multipart/form-data'}}),
			[],
		);
	},

	async update(localization, id, data, errorNames, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.patch(`catalog/products/${id}`, data), errorNames);
	},

	async remove(localization, id, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.delete(`catalog/products/${id}`));
	},

	async removePhoto(localization, id, onError = () => {
	}) {
		return await fetchApi(localization, onError, axios => axios.delete(`catalog/products/photo/${id}`));
	},

	async downloadPhotosArchiveByArticlesExcel(localization, formData: FormData, onError = () => {
	}) {
		try {
			const client = await axios();
			const response = await client.post(
				'catalog/products/photos/download-by-articles-excel',
				formData,
				{
					headers: { 'Content-Type': 'multipart/form-data' },
					responseType: 'blob',
				},
			);
			const blob = response.data as Blob;
			const ct = String(response.headers['content-type'] || '');
			if (ct.includes('application/json')) {
				const text = await blob.text();
				let json: any;
				try {
					json = JSON.parse(text);
				} catch {
					onError(processErrBlob(localization, response.status, text), toNumber(response.status) || -1);
					return null;
				}
				const msg = json.message || (Array.isArray(json.errors) ? json.errors[0] : undefined) || text;
				onError(processErrBlob(localization, response.status, String(msg)), toNumber(response.status) || -1);
				return null;
			}
			return {
				blob,
				filename: parseContentDispositionFilename(response.headers['content-disposition'] as string | undefined) || 'product-photos.zip',
			};
		} catch (e: any) {
			if (e.response?.data instanceof Blob) {
				const text = await e.response.data.text();
				try {
					e.response.data = JSON.parse(text);
				} catch {
					e.response.data = { message: text };
				}
			}
			e.parseErrors(
				[],
				(err, type) => onError(
					processErrBlob(localization, e.response?.status, err),
					toNumber(e.response?.status) || (typeof window !== 'undefined' && window.navigator.onLine ? -1 : 0),
					type,
				),
				() => onError(e.response?.data?.message || '', 429),
			);
		}
		return null;
	},
};

export default productsService;
