<script setup lang="ts">
import { activityTypeListUrl } from "~/utils/activityTypeList";

const props = withDefaults(defineProps<{ memberSegment?: 'collections' | 'items' }>(), { memberSegment: 'collections' });
const route = useRoute();
const { globalProfiles } = useGlobalProfiles();
const { pagination, getPageUrl } = usePageInfo();
const listingPath = computed(() => `${route.path.replace(/\/$/, '')}/${props.memberSegment}`);
const urlPath = ref('');
watch(() => route.fullPath, () => {
    const query = new URLSearchParams(getPageUrl().split('?')[1] || '');
    // Parent object profiles and identifiers must not constrain the member list.
    for (const key of ['uri', '_profile', '_mediatype']) query.delete(key);
    urlPath.value = activityTypeListUrl(`${listingPath.value}?${query}`);
}, { immediate: true });
const { data, status, error } = useGetList(useGetPrezAPIEndpoint(), urlPath);
const currentProfile = computed(() => data.value?.profiles.find(profile => profile.current));
</script>

<template>
    <section class="mt-8" aria-label="Register items">
        <h2 class="mb-4 text-xl font-semibold">Items</h2>
        <Message v-if="error" severity="error">{{ error }}</Message>
        <Loading v-else-if="status === 'pending'" />
        <template v-else-if="data">
            <ItemList :list="data.data" :fields="globalProfiles?.[currentProfile?.uri || '']" :listing-path="listingPath" />
            <PrezPagination :total-items="data.count" :pagination="pagination" :max-reached="data.maxReached" />
        </template>
    </section>
</template>
