<script lang="ts" setup>
import { SearchResults, type SearchResultsProps } from "prez-components";
import { visibleTypes } from "~/utils/displayTypes";

const props = defineProps<SearchResultsProps>();
const results = computed(() => props.results.map(result => ({
    ...result,
    resource: { ...result.resource, rdfTypes: visibleTypes(result.resource.rdfTypes) },
})));
const node = resolveComponent("Node") as Component;
const term = resolveComponent("Term") as Component;
const literal = resolveComponent("Literal") as Component;
const itemLink = resolveComponent("ItemLink") as Component;
</script>

<template>
    <SearchResults :results="results" :_components="{node, term, literal, itemLink}" />
</template>
