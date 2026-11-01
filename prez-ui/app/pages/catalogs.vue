<script lang="ts" setup>
const route = useRoute();
await navigateTo({ path: '/registers', query: route.query }, { replace: true });
</script>
