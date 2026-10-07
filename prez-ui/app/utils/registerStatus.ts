import type { ItemListProps } from 'prez-components';

export const isSubRegisterList = (path: string) =>
    /^\/catalogs\/reg(?::|%3a)top\/collections\/[^/]+\/items\/?$/i.test(path);

export function registerListUrl(url: string): string {
    const [path, query = ''] = url.split('?');
    if (!path || !isSubRegisterList(path)) return url;
    const params = new URLSearchParams(query);
    if (params.has('_profile')) return url;
    params.set('_profile', 'prez:OGCListingProfile');
    return `${path}?${params}`;
}

export function registerStatus(item: ItemListProps['list'][number], path: string, registerIri?: string) {
    const registerPath = decodeURIComponent(path.replace(/\/items\/?$/, ''));
    return (item.properties?.['http://example.org/qualifiedStatus']?.objects || []).flatMap(status => {
        const properties = (status as ItemListProps['list'][number]).properties;
        const memberships = properties?.['https://schema.org/memberOf']?.objects || [];
        const matches = memberships.some(member => member.value === registerIri ||
            ('links' in member && (member.links as Array<{ value: string }> | undefined)?.some(link => decodeURIComponent(link.value) === registerPath)));
        return matches ? properties?.['https://schema.org/value']?.objects || [] : [];
    });
}
