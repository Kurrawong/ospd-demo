export default defineAppConfig({
    nameSubstitutions: { catalogs: 'Registers', catalog: 'Register', registers: 'Registers', register: 'Register' } as Record<string, string>,
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
