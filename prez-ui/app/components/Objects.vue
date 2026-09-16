<script lang="ts" setup>
import { Objects, type ObjectsProps } from "prez-components";
import { visibleTypes } from "~/utils/displayTypes";

const props = defineProps<ObjectsProps>();
const objects = computed(() => props.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
    ? visibleTypes(props.objects)
    : props.objects);
const term = resolveComponent("Term") as Component;
</script>

<template>
    <Objects v-bind="props" :objects="objects" :_components="{term}">
        <template #default="slotProps"><slot v-bind="slotProps" /></template>
    </Objects>
</template>
