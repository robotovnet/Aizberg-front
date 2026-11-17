import processAuthentication from '../../../../middleware/processAuthentication';

export async function addPageContext(pageContext: any): Promise<{}> {
	const { id } = pageContext.routeParams;
	// const { redirectTo } = pageContext.redirectTo;
	// console.log(pageContext.redirectTo);
	return { pageProps: { filterId: id, ...((await processAuthentication(pageContext)) as any).pageProps } };
}

export const passToClient = ['pageProps', 'routeParams'];
