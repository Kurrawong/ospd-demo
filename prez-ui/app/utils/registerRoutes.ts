// Only the root UI listing changes; the API and resource URLs stay stable.
export function registerApiUrl(url: string): string {
    const mapped = url.replace(/^\/registers\/?(?=\?|$)/, '/catalogs');
    const [path, query = ''] = mapped.split('?');
    if (!/^\/catalogs\/?$/.test(path || '')) return mapped;
    const params = new URLSearchParams(query);
    if (params.get('_profile') !== 'altr-ext:alt-profile') {
        params.set('order_by', 'https://schema.org/name');
        params.set('order_by_direction', 'ASC');
    }
    return `${path}?${params}`;
}
export const registerUiUrl = (url: string) => url.replace(/^\/catalogs\/?(?=[?#]|$)/, '/registers');
