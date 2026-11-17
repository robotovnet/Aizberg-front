import axios from 'axios';
import retrieveCountryId from '../middleware/location';
import getCookie from '../middleware/getCookie';
import { getApiUrl } from '../utils/constants';

export default async () => axios.create({
	withCredentials: true,
	responseType: 'json',
	baseURL: getApiUrl(),
	headers: {
		'X-Client-Lang': (typeof document !== 'undefined') ? getCookie(document, 'client_language') || 'ru' : 'ru',
		'X-Client-Country': (typeof document !== 'undefined') ? await retrieveCountryId(document) : '',
		'X-Requested-With': 'XMLHttpRequest',
		'Content-Type': 'application/json;charset=utf-8',
	},
});
