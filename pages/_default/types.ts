import type { PageContextBuiltIn } from 'vite-plugin-ssr/types';

export type PageProps = { [prop: string]: any }
export type PageContext = PageContextBuiltIn & {
  Page: any,
  pageProps?: PageProps
  documentProps?: {
    title?: string
    description?: string
  },
  cookies?: { [cookie: string]: string },
  redirectTo?: string
}
