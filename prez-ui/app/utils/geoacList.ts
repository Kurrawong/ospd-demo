import type { ItemListProps } from 'prez-components';

export const geoacNamePredicate = 'https://schema.org/name';
export const geoacRelationPredicates = [
    'http://www.w3.org/2004/02/skos/core#broader',
    'http://www.w3.org/2004/02/skos/core#related',
];

export const isGeoacList = (path: string) =>
    /^\/catalogs\/demo(?::|%3a)geoacs\/collections\/demo(?::|%3a)(ospd|cro|euro|ogc)-geoacs\/items\/?$/i.test(path);

export const geoacIdentifier = (iri: string) => iri.replace(/\/$/, '').split(/[/#]/).pop() || iri;

export const geoacName = (item: ItemListProps['list'][number]) =>
    item.properties?.[geoacNamePredicate]?.objects[0]?.value || item.label?.value || geoacIdentifier(item.value);

// Apply before pagination so every page belongs to the same alphabetical list.
export function geoacListUrl(url: string): string {
    const [path, query = ''] = url.split('?');
    if (!path || !isGeoacList(path)) return url;
    const params = new URLSearchParams(query);
    if (params.get('_profile') === 'altr-ext:alt-profile') return url;
    params.set('order_by', geoacNamePredicate);
    params.set('order_by_direction', 'ASC');
    return `${path}?${params}`;
}
