<script lang="ts" setup>
import { Node, type NodeProps } from "prez-components";

import { registerLabel } from "~/utils/registerLabels";

const props = defineProps<NodeProps>();
const displayTerm = computed(() => ({ ...props.term, ...(props.term.label ? { label: { ...props.term.label, value: registerLabel(props.term.label.value) } } : {}) }));
const itemLink = resolveComponent("ItemLink") as Component;
</script>

<template>
    <Node v-bind="props" :term="displayTerm" :_components="{itemLink}">
        <template #default="slotProps"><slot v-bind="slotProps" /></template>
        <template #wrapper="slotProps"><slot name="wrapper" v-bind="slotProps" /></template>
    </Node>
</template>
