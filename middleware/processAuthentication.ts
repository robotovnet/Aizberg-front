import axios from 'axios';
import { PageContext } from '../pages/_default/types';
import { getApiUrl, getDockerApiUrl } from '../utils/constants';

export function authCookie(sessionId: string): string {
	return `session_id=${sessionId}; path=/; max-age=86400; SameSite=Strict; secure`;
}

export function logoutCookie(): string {
	return `session_id= ; expires = Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
}

export default async (pageContext: PageContext) => {
	let authenticated = false;
	
	const headers = [{
		name: 'Set-Cookie',
		value: logoutCookie(),
	}];

	if (pageContext.url === '/staff/logout') {
		return { redirectTo: '/staff/login', headers };
	}
	if (!pageContext.cookies?.session_id && !pageContext.url.startsWith('/staff/login')
		&& pageContext.url.indexOf('/staff/password-recovery') === -1) {
		return { redirectTo: `/staff/login?redirectUrl=${encodeURIComponent(pageContext.urlNormalized)}` };
	}
	if (pageContext.cookies?.session_id) {
		try {
			const url = `/staff/session/${pageContext.cookies?.session_id}`;
			const apiUrl = getApiUrl();
			const dockerApiUrl = getDockerApiUrl();
			
			if (!dockerApiUrl) {
				throw new Error('VITE_DOCKER_API_URL не определен в переменных окружения');
			}
			
			let apiDomain = (new URL(apiUrl));
			const startTime = Date.now();
			
			const response = await axios.create({
				baseURL: dockerApiUrl,
				timeout: 5000,
				responseType: 'json',
				headers: {
					'Host': apiDomain.hostname,
					'X-Requested-With': 'XMLHttpRequest',
					'Content-Type': 'application/json;charset=utf-8',
				},
			}).get(url);

			const endTime = Date.now();
			
			if (!response.data.is_session_active) {
				return { redirectTo: `/staff/login`, headers };
			}

			if (pageContext.url === '/staff/login'
				|| pageContext.url.indexOf('/staff/password-recovery') === 0) {
				return { redirectTo: '/' };
			}
			
			authenticated = true;
		} catch (e: any) {
			if (pageContext.url !== '/staff/login') {
				return { redirectTo: '/staff/login', headers };
			}
		}
  	
	}
	
	return {
		...pageContext,
		pageProps: {
			...pageContext.pageProps, authenticated,
		},
	};
};
