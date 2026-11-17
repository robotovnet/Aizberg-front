import { AxiosInstance, AxiosResponse } from 'axios';
import axios from '../network/axios';
import '../extensions/parseErrors';
import { OnError } from '../types/service';

const toNumber = (data) => {
	if (Number.isFinite(data)) return data;
	if (typeof data === 'string' || data instanceof String) return parseInt(data as string, 10);
	return undefined;
};

// eslint-disable-next-line no-nested-ternary
const processErr = (localization, status, err: string) => ((!status && window.navigator.onLine) ? localization.t('text.unknownError')
	: (!status && !window.navigator.onLine) ? localization.t('text.offlineError') : err);

// eslint-disable-next-line func-names
export default async function (
	localization,
	onError: OnError,
	// eslint-disable-next-line no-shadow,no-unused-vars
	onRequest: (axios: AxiosInstance) => Promise<AxiosResponse<any>>,
	errors: string[] = [],
) {
	try {
		const response = await onRequest(await axios());
		return response.data;
	} catch (e: any) {
		e.parseErrors(
			errors,
			(err, type) => onError(
				processErr(localization, e.response?.status, err),
				toNumber(e.response?.status) || (window.navigator.onLine) ? -1 : 0,
				type,
			),
			() => onError(e.response?.data?.message || '', 429),
		);
	}
	return {};
}
