import axios from 'axios';
import getCookie from './getCookie';

let countryTask: (Promise<string|undefined>)|undefined;

async function determineCountryId() {
	let countryId;
	try {
		const repsone = await axios.get('https://www.cloudflare.com/cdn-cgi/trace');
		const location = repsone.data.split('\n').find((item: string) => item.startsWith('loc'));
		if (location) {
			const locationParts = location.split('=');
			countryId = (locationParts.length > 1) ? locationParts[1] : undefined;
		}
	} catch (e: any) {
		console.error(e.message);
	}
	return countryId;
}

export default async (doc: Document): Promise<string> => {
	if (!doc || !location) { return ''; }
	let currentCountryId = getCookie(doc, 'client_country');
	if (!currentCountryId) {
		if (!countryTask) { countryTask = determineCountryId(); }
		currentCountryId = (await countryTask) || '';
		const now = new Date();
		now.setMonth(now.getMonth() + 3);
		if (currentCountryId) { doc.cookie = `client_country=${currentCountryId}; expires=${now.toUTCString()}; SameSite=Strict; max-age=86400; secure`; }
		countryTask = undefined;
	}
	return (currentCountryId) || '';
};
