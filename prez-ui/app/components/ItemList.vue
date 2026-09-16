<script lang="ts" setup>
import { ItemList, type ItemListProps } from "prez-components";

const props = defineProps<ItemListProps>();
const route = useRoute();
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
    <ItemList v-bind="props" :fields="fields" :_components="{predicate, node, objects}" />
</template>
