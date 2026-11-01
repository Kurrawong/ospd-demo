<script lang="ts" setup>
import { ItemBreadcrumb, type ItemBreadcrumbProps } from "prez-components";
import { registerUiUrl } from "~/utils/registerRoutes";

const props = defineProps<ItemBreadcrumbProps>();
const parents = computed(() => props.parents?.map(parent => ({ ...parent, url: registerUiUrl(parent.url) })));
const customItems = computed(() => props.customItems?.map(item => ({ ...item, url: item.url ? registerUiUrl(item.url) : item.url })));
const literal = resolveComponent("Literal") as Component;
const itemLink = resolveComponent("ItemLink") as Component;
</script>

<template>
    <ItemBreadcrumb v-bind="props" :parents="parents" :custom-items="customItems" :_components="{literal, itemLink}" />
</template>
