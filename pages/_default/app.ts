import { createSSRApp, defineComponent, h } from 'vue';
import { createI18n } from 'vue-i18n/index';
import Toaster from '@meforma/vue-toaster';
import dayjs from 'dayjs';
import PageLayout from './PageLayout.vue';
import { PageContext } from './types';
import retrieveStore from '../../store/retrieveStore';
import translation from '../../localization/translation';
import AppPage from '../_components/AppPage.vue';

function createApp(pageContext: PageContext) {
	const { Page, pageProps } = pageContext;
	// eslint-disable-next-line no-underscore-dangle
	const pageId = (pageContext as any)._pageId;
	const PageWithLayout = defineComponent({
		render() {
			return h(
				PageLayout,
				{},
				{
					default() {
						return h(Page, pageProps || {});
					},
				},
			);
		},
	});
	const app = createSSRApp(PageWithLayout);
	const store = retrieveStore(pageId);
	if (store) {
		app.use(store);
	}
	app.use(createI18n({
		locale: 'ru',
		messages: translation(pageId),
	}) as any);
	app.use(Toaster).provide('toast', app.config.globalProperties.$toast);
	app.provide('dayJS', dayjs); // provide dayJS
	app.component('AppPage', AppPage);
	// We make `pageContext.routeParams` available in all components as `$routeParams`
	// (e.g. `$routeParams.movieId` for a Route String `/movie/:movieId`).
	app.config.globalProperties.$routeParams = pageContext.routeParams;
	return app;
}

// eslint-disable-next-line import/prefer-default-export
export { createApp };
