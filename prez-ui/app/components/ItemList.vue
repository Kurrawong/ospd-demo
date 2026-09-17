<script lang="ts" setup>
import { ItemList, type ItemListProps } from "prez-components";
import { geoacIdentifier, geoacName, geoacRelationPredicates, isGeoacList } from '~/utils/geoacList';

const props = defineProps<ItemListProps>();
const route = useRoute();
const showActivities = computed(() => isGeoacList(route.path) && route.query._profile !== 'altr-ext:alt-profile');
// RDF statements do not retain the API's ordering; restore it for this page.
const activities = computed(() => [...props.list].sort((a, b) =>
    geoacName(a).toLowerCase().localeCompare(geoacName(b).toLowerCase()) || a.value.localeCompare(b.value)));
const fields = computed(() =>
    /^\/catalogs\/demo(?::|%3a)geoacs\/collections\/?$/i.test(route.path)
        ? []
        : props.fields
);
const predicate = resolveComponent("Predicate") as Component;
const node = resolveComponent("Node") as Component;
const objects = resolveComponent("Objects") as Component;
</script>

<template>
    <div v-if="showActivities" class="relative w-full overflow-x-auto">
        <table class="item-list w-full min-w-[50rem] caption-bottom text-sm">
            <thead class="border-b">
                <tr>
                    <th v-for="heading in ['ID', 'name', 'broader', 'related']" :key="heading" scope="col" class="h-10 px-2 text-left align-middle font-bold">{{ heading }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in activities" :key="item.value" class="border-b odd:bg-muted/50">
                    <td class="p-2 align-top">
                        <ItemLink :to="item" variant="item-list">{{ geoacIdentifier(item.value) }}</ItemLink>
                    </td>
                    <td class="p-2 align-top">{{ geoacName(item) }}</td>
                    <td v-for="iri in geoacRelationPredicates" :key="iri" class="p-2 align-top">
                        <Objects
                            v-if="item.properties?.[iri]"
                            :term="item"
                            :predicate="item.properties[iri]!.predicate"
                            :objects="item.properties[iri]!.objects"
                            variant="item-table"
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <ItemList v-else v-bind="props" :fields="fields" :_components="{predicate, node, objects}" />
</template>
