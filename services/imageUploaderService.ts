import fetchApi from '../network/fetchEndpoint';

const imageUploaderService = {
	async getAll(localization, page, category, onError = () => {}) {
		let url = `image-uploader?page=${page}`;
		if (category) {
			url += `&category=${encodeURIComponent(category)}`;
		}
		return await fetchApi(localization, onError, axios => axios.get(url));
	},

	async getCategories(localization, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.get('image-uploader/categories'));
	},

	async get(localization, id, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.get(`image-uploader/${id}`));
	},

	async create(localization, formData, errorNames, onError = () => {}) {
		return await fetchApi(
			localization,
			onError,
			axios => axios.post('image-uploader', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			}),
			errorNames,
		);
	},

	async update(localization, id, data, errorNames, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.patch(`image-uploader/${id}`, data), errorNames);
	},

	async remove(localization, id, onError = () => {}) {
		return await fetchApi(localization, onError, axios => axios.delete(`image-uploader/${id}`));
	},
};

export default imageUploaderService;

