import processAuthentication from "../../../../middleware/processAuthentication";

export async function addPageContext(pageContext: any): Promise<{}> {

    const { setting } = pageContext.routeParams
    return { pageProps: { fetchedSetting: setting, ...((await processAuthentication(pageContext)) as any).pageProps } }
}

export const passToClient = ['pageProps', 'routeParams']
