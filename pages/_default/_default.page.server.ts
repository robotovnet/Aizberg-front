import { renderToString } from '@vue/server-renderer';
import { html } from 'vite-plugin-ssr';
import { createApp } from './app';
import { PageContext } from './types';
import processAuthentication from '../../middleware/processAuthentication';
import { /* useClientRouter, */ navigate } from 'vite-plugin-ssr/client/router'

export { render };
export { passToClient };

// See https://github.com/brillout/vite-plugin-ssr#data-fetching
const passToClient = ['pageProps', 'routeParams', 'redirectTo'];

export async function addPageContext(pageContext: PageContext): Promise<{}> {
	return await processAuthentication(pageContext);
}

async function render(pageContext: PageContext) {
	const { redirectTo } = pageContext;
	if (redirectTo) return { redirectTo };
	
	
	// console.log(redirectTo);
	// if (redirectTo) {
	// 	navigate(redirectTo)
	// 	return;
	// };

	const app = createApp(pageContext);
	const appHtml = await renderToString(app);

	// See https://github.com/brillout/vite-plugin-ssr#html-head
	const { documentProps } = pageContext;
	const title = ((documentProps && documentProps.title) && `Aizberg - ${documentProps && documentProps.title}`) || 'Aizberg';
	const desc = (documentProps && documentProps.description) || '';
	return html`<!DOCTYPE html>
		<html lang="ru">
		<head>
			<meta charset="UTF-8">
			<link rel="shortcut icon" type="image/png" href="/favicon.ico"/>
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>${title}</title>
		</head>
		<body>
		<div class="container" id="app">${html.dangerouslySkipEscape(appHtml)}</div>
		</body>
		</html>`;
}
