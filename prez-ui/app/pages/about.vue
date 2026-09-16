<script lang="ts" setup>
const appConfig = useAppConfig();
</script>

<template>
    <NuxtLayout>
        <template #breadcrumb>
            <ItemBreadcrumb :custom-items="[...(appConfig.breadcrumbPrepend || []), {label: 'About this System'}]" />
        </template>
        <template #header-text>About this System</template>
        <template #default>
            <p>
                The system used for this demonstration set of registers is
                <a href="https://prez.dev">Prez</a> which is an open source Application
                Programming Interface (API) and user interface (UI) system that presents
                information stored in
                <a href="https://en.wikipedia.org/wiki/Knowledge_graph">Knowledge Graphs</a>
                on the Internet.
            </p>
            <br>
            <p>
                Prez is used by the <a href="https://www.ogc.org/">Open Geospatial Consortium</a>
                for their <a href="https://defs.opengis.net">Definitions Service</a>.
            </p>
            <h2 class="text-xl mt-8">Documentation</h2>
            <p>See the <a href="https://github.com/RDFLib/prez-ui" target="_blank" rel="noopener noreferrer">Prez UI GitHub</a> for
                documentation on the frontend, and the <a href="https://github.com/RDFLib/prez" target="_blank" rel="noopener noreferrer">Prez API GitHub</a> for documentation on the API.
            </p>
            <h2 class="text-xl mt-8">License</h2>
            <p>Prez is licensed using the <a href="https://github.com/rdflib/prez/blob/main/LICENSE" target="_blank"
                rel="noopener noreferrer">BSD 3-Clause licence</a>.</p>
        </template>
    </NuxtLayout>
</template>
