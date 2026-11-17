import { getPage } from 'vite-plugin-ssr/client';
import { createApp } from './app';
import { PageContext } from './types';
import '../../assets/css/app.sass';
// import AppPage from '../_components/AppPage.vue';
import { /* useClientRouter, */ navigate } from 'vite-plugin-ssr/client/router'

/* useClientRouter({
  render: (pageContext) => {

  },
  onTransitionStart: async () => {
  },
  onTransitionEnd: () => {}
}) */

async function main() {
	const pageContext = (await getPage()) as PageContext;
	hydrate(pageContext);
	// render(pageContext);
}

function hydrate(pageContext: PageContext) {
	const app = createApp(pageContext);
	app.config.globalProperties.$pageId = (pageContext as any)._pageId;
	app.config.globalProperties.$authenticated = pageContext.pageProps?.authenticated;
	app.config.globalProperties.window = window;
	// app.component('AppPage', AppPage);
	app.mount('#app');
}
// async function render(pageContext: PageContext) {
// 	const { redirectTo } = pageContext;
// 	// console.log(redirectTo);
// 	if (redirectTo) {
// 		navigate(redirectTo)
// 		return;
// 	};
// }
main();
