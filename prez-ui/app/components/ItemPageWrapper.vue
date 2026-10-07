<script lang="ts" setup>
import { visibleTypes, withoutTypeRow } from "~/utils/displayTypes";

const route = useRoute();
const isSubRegister = computed(() => /^\/catalogs\/reg(?::|%3a)top\/collections\/[^/]+\/?$/i.test(route.path));
const isRegister = computed(() => /^\/catalogs\/[^/]+\/?$/.test(route.path));
</script>

<template>
    <ItemPage v-if="route.query._profile !== 'altr-ext:alt-profile'">
        <template #header-identifiers="{ data }">
            <template v-if="data">
                <div class="mb-2 mt-2 flex flex-row items-center">
                    <Badge variant="secondary" class="mr-2 rounded-md">IRI</Badge>
                    <ItemLink :secondary-to="data.data.value" copy-link>{{ data.data.value }}</ItemLink>
                </div>
                <div v-if="visibleTypes(data.data.rdfTypes).length" class="flex flex-row gap-3">
                    <Badge variant="secondary" class="self-start rounded-md">Type</Badge>
                    <div>
                        <div v-for="rdfType in visibleTypes(data.data.rdfTypes)" :key="rdfType.value">
                            <Node :term="rdfType" />
                        </div>
                    </div>
                </div>
            </template>
        </template>
        <template #item-members="{ data }">
            <RegisterItems v-if="isRegister || isSubRegister" :key="route.path" :register-iri="data?.data.value" :member-segment="isSubRegister ? 'items' : 'collections'" />
            <span v-else-if="data?.data.rdfTypes?.some(type => type.value === 'https://schema.org/Organization')" class="hidden" aria-hidden="true"></span>
            <p v-else-if="data?.data.members && !data.data.rdfTypes?.some(type => type.value === 'https://schema.org/Organization') && !data.profiles.some(profile => profile.current && profile.uri === 'https://prez.dev/OGCSchemesObjectProfile')" class="mt-6">
                <Button as-child><ItemLink :to="data.data.members.value">Members</ItemLink></Button>
            </p>
        </template>
        <template #item-table="{ data }">
            <ItemTable
                v-if="data"
                :key="route.fullPath + JSON.stringify(data.data.properties)"
                :term="withoutTypeRow(data.data)"
            />
        </template>
    </ItemPage>
    <ListPage v-else />
</template>
