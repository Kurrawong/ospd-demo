<script lang="ts" setup>
import { registerLabel } from "~/utils/registerLabels";
import { visibleTypes } from "~/utils/displayTypes";
import { ItemList, type ItemListProps } from "prez-components";
import { geoacIdentifier, geoacName, geoacRelationPredicates, isGeoacList } from '~/utils/geoacList';

const props = defineProps<ItemListProps & { listingPath?: string }>();
const registerItemType = 'http://def.isotc211.org/ont/19135/RegisterItem';
const rdfType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const tableItems = computed(() => props.list.map(item => Object.assign(Object.create(Object.getPrototypeOf(item)) as typeof item, item, {
    rdfTypes: visibleTypes(item.rdfTypes).filter(type => type.value !== registerItemType),
    properties: item.properties?.[rdfType] ? {
        ...item.properties,
        [rdfType]: {
            ...item.properties[rdfType]!,
            objects: item.properties[rdfType]!.objects.filter(type => type.value !== registerItemType),
        },
    } : item.properties,
})));
const route = useRoute();
const listingPath = computed(() => props.listingPath || route.path);
const registerManager = 'http://def.isotc211.org/ont/19135/registerManager';
const showRegisters = computed(() => /^\/catalogs\/reg(?::|%3a)top\/collections\/?$/i.test(listingPath.value)
    && route.query._profile !== 'altr-ext:alt-profile');
const showRegisterItems = computed(() => (
    /^\/catalogs\/demo(?::|%3a)(models|vocs)\/collections\/?$/i.test(listingPath.value)
    || /^\/catalogs\/reg(?::|%3a)top\/collections\/[^/]+\/items\/?$/i.test(listingPath.value)
) && route.query._profile !== 'altr-ext:alt-profile');
const registerColumns = [
    { label: 'Publisher', iri: 'https://schema.org/publisher' },
    { label: 'Status', iri: 'http://purl.org/linked-data/registry#status' },
];
const showActivities = computed(() => isGeoacList(listingPath.value) && route.query._profile !== 'altr-ext:alt-profile');
// RDF statements do not retain the API's ordering; restore it for this page.
const activities = computed(() => [...tableItems.value].sort((a, b) =>
    geoacName(a).toLowerCase().localeCompare(geoacName(b).toLowerCase()) || a.value.localeCompare(b.value)));
const fields = computed(() =>
    /^\/catalogs\/demo(?::|%3a)geoacs\/collections\/?$/i.test(listingPath.value)
        ? []
        : props.fields
);
const predicate = resolveComponent("Predicate") as Component;
const node = resolveComponent("Node") as Component;
const objects = resolveComponent("Objects") as Component;
</script>

<template>
    <div v-if="showRegisters" class="relative w-full overflow-x-auto">
        <table class="item-list w-full caption-bottom text-sm">
            <thead class="border-b">
                <tr>
                    <th scope="col" class="h-10 px-2 text-left font-bold">Item</th>
                    <th scope="col" class="h-10 px-2 text-left font-bold">register manager</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in tableItems" :key="item.value" class="border-b odd:bg-muted/50">
                    <td class="p-2 align-top"><ItemLink :to="item" variant="item-list">{{ registerLabel(geoacName(item)) }}</ItemLink></td>
                    <td class="p-2 align-top">
                        <Objects v-if="item.properties?.[registerManager]" :term="item"
                            :predicate="item.properties[registerManager]!.predicate"
                            :objects="item.properties[registerManager]!.objects" variant="item-table" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else-if="showRegisterItems" class="relative w-full overflow-x-auto">
        <table class="item-list w-full caption-bottom text-sm">
            <thead class="border-b"><tr>
                <th v-for="heading in ['Item', 'Type', 'Publisher', 'Status']" :key="heading" scope="col" class="h-10 px-2 text-left font-bold">{{ heading }}</th>
            </tr></thead>
            <tbody><tr v-for="item in tableItems" :key="item.value" class="border-b odd:bg-muted/50">
                <td class="p-2 align-top"><ItemLink :to="item" variant="item-list">{{ registerLabel(item.label?.value || geoacName(item)) }}</ItemLink></td>
                <td class="p-2 align-top"><div v-for="type in visibleTypes(item.rdfTypes)" :key="type.value"><Node :term="type" /></div></td>
                <td v-for="column in registerColumns" :key="column.iri" class="p-2 align-top">
                    <Objects v-if="item.properties?.[column.iri]" :term="item" :predicate="item.properties[column.iri]!.predicate" :objects="item.properties[column.iri]!.objects" variant="item-table" />
                </td>
            </tr></tbody>
        </table>
    </div>
    <div v-else-if="showActivities" class="relative w-full overflow-x-auto">
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
                    <td class="p-2 align-top">{{ registerLabel(geoacName(item)) }}</td>
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
    <ItemList v-else v-bind="props" :list="tableItems" :fields="fields" :_components="{predicate, node, objects}" />
</template>
