import processAuthentication from "../../../../middleware/processAuthentication";

export async function addPageContext(pageContext: any): Promise<{}> {

    const { id } = pageContext.routeParams
    return { pageProps: { companyId: id, ...((await processAuthentication(pageContext)) as any).pageProps} }
}

export const passToClient = ['pageProps', 'routeParams']