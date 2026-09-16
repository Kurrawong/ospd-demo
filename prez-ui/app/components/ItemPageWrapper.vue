<script lang="ts" setup>
import { visibleTypes, withoutTypeRow } from "~/utils/displayTypes";

const route = useRoute();
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
