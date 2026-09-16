export default defineAppConfig({
    pagination: {
        itemsPerPage: 50,
        conceptsPerPage: 50,
    },
});

declare module '@nuxt/schema' {
    interface AppConfigInput {
        menu?: Array<{ label: string, url: string, active?: boolean }>,
        nameSubstitutions?: Record<string, string>,
        breadcrumbPrepend?: Array<{ label: string, url: string }>,
        utilsMenu?: Array<{ label: string, url: string }>
    }
}
