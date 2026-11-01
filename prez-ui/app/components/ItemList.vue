<script lang="ts" setup>
import { registerLabel } from "~/utils/registerLabels";
import { visibleTypes } from "~/utils/displayTypes";
import { ItemList, type ItemListProps } from "prez-components";
import {
    activityTypeIdentifier,
    activityTypeName,
    activityTypeRelationPredicates,
    isActivityTypeList,
} from '~/utils/activityTypeList';

const props = defineProps<ItemListProps & { listingPath?: string }>();
const rdfType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const tableItems = computed(() => props.list.map(item => Object.assign(Object.create(Object.getPrototypeOf(item)) as typeof item, item, {
    rdfTypes: visibleTypes(item.rdfTypes),
    properties: item.properties?.[rdfType] ? {
        ...item.properties,
        [rdfType]: {
            ...item.properties[rdfType]!,
            objects: visibleTypes(item.properties[rdfType]!.objects),
        },
    } : item.properties,
})));
const route = useRoute();
const listingPath = computed(() => props.listingPath || route.path);
const registerManager = 'https://w3id.org/ogc/rim/registerManager';
const isRootRegisters = computed(() => /^\/(registers|catalogs)\/?$/i.test(listingPath.value));
const showRegisters = computed(() => (isRootRegisters.value || /^\/catalogs\/reg(?::|%3a)top\/collections\/?$/i.test(listingPath.value))
    && route.query._profile !== 'altr-ext:alt-profile');
const showRegisterItems = computed(() => (
    /^\/catalogs\/demo(?::|%3a)(models|vocs|orgs)\/collections\/?$/i.test(listingPath.value)
) && route.query._profile !== 'altr-ext:alt-profile');
const showActivities = computed(() => isActivityTypeList(listingPath.value) && route.query._profile !== 'altr-ext:alt-profile');
// RDF statements do not retain the API's ordering; restore it for this page.
const activities = computed(() => [...tableItems.value].sort((a, b) =>
    activityTypeName(a).toLowerCase().localeCompare(activityTypeName(b).toLowerCase()) || a.value.localeCompare(b.value)));
const registers = computed(() => isRootRegisters.value
    ? [...tableItems.value].sort((a, b) => registerLabel(a.label?.value || activityTypeName(a)).localeCompare(
        registerLabel(b.label?.value || activityTypeName(b)), undefined, { sensitivity: 'base' }) || a.value.localeCompare(b.value))
    : tableItems.value);
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
                <tr v-for="item in registers" :key="item.value" class="border-b odd:bg-muted/50">
                    <td class="p-2 align-top"><ItemLink :to="item" variant="item-list">{{ registerLabel(activityTypeName(item)) }}</ItemLink></td>
                    <td class="p-2 align-top">
                        <Objects v-if="item.properties?.[registerManager]" :term="item"
                            :predicate="item.properties[registerManager]!.predicate"
                            :objects="item.properties[registerManager]!.objects" variant="item-table" />
                        <span v-else class="text-muted-foreground">Not specified</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else-if="showRegisterItems" class="relative w-full overflow-x-auto">
        <table class="item-list w-full caption-bottom text-sm">
            <thead class="border-b"><tr>
                <th v-for="heading in ['Item', 'Type']" :key="heading" scope="col" class="h-10 px-2 text-left font-bold">{{ heading }}</th>
            </tr></thead>
            <tbody><tr v-for="item in tableItems" :key="item.value" class="border-b odd:bg-muted/50">
                <td class="p-2 align-top"><ItemLink :to="item" variant="item-list">{{ registerLabel(item.label?.value || activityTypeName(item)) }}</ItemLink></td>
                <td class="p-2 align-top"><div v-for="type in visibleTypes(item.rdfTypes)" :key="type.value"><Node :term="type" /></div></td>
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
                        <ItemLink :to="item" variant="item-list">{{ activityTypeIdentifier(item.value) }}</ItemLink>
                    </td>
                    <td class="p-2 align-top">{{ registerLabel(activityTypeName(item)) }}</td>
                    <td v-for="iri in activityTypeRelationPredicates" :key="iri" class="p-2 align-top">
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
    <ItemList v-else v-bind="props" :list="tableItems" :_components="{predicate, node, objects}" />
</template>
