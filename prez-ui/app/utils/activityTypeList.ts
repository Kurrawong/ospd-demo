import type { ItemListProps } from 'prez-components';

export const activityTypeNamePredicate = 'https://schema.org/name';
export const activityTypeRelationPredicates = [
    'http://www.w3.org/2004/02/skos/core#broader',
    'http://www.w3.org/2004/02/skos/core#related',
];

export const isActivityTypeList = (path: string) =>
    /^\/catalogs\/reg(?::|%3a)top\/collections\/[^/]+\/items\/?$/i.test(path);

export const activityTypeIdentifier = (iri: string) => iri.replace(/\/$/, '').split(/[/#]/).pop() || iri;

export const activityTypeName = (item: ItemListProps['list'][number]) =>
    item.properties?.[activityTypeNamePredicate]?.objects[0]?.value
    || item.label?.value
    || activityTypeIdentifier(item.value);

// Apply before pagination so every page belongs to the same alphabetical list.
export function activityTypeListUrl(url: string): string {
    const [path, query = ''] = url.split('?');
    if (!path || !isActivityTypeList(path)) return url;
    const params = new URLSearchParams(query);
    if (params.get('_profile') === 'altr-ext:alt-profile') return url;
    params.set('order_by', activityTypeNamePredicate);
    params.set('order_by_direction', 'ASC');
    return `${path}?${params}`;
}
