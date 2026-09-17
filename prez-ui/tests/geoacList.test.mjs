import assert from 'node:assert/strict';
import { test } from 'node:test';
import { geoacIdentifier, geoacListUrl, geoacName, isGeoacList } from '../app/utils/geoacList.ts';

const base = '/catalogs/demo:geoacs/collections/demo:ospd-geoacs/items';

test('only the four activity listings receive the custom table', () => {
    for (const register of ['ospd', 'cro', 'euro', 'ogc']) {
        const path = base.replace('ospd-geoacs', `${register}-geoacs`);
        assert.ok(isGeoacList(path));
        assert.ok(isGeoacList(path.replaceAll(':', '%3A') + '/'));
    }
    assert.ok(!isGeoacList(`${base}/demo:GA001`));
    assert.ok(!isGeoacList(base.replace('ospd-geoacs', 'other')));
});

test('name ordering applies on every API page and preserves filters and profiles', () => {
    for (const page of [1, 2, 3]) {
        const url = new URL(geoacListUrl(`${base}?page=${page}&limit=2&filter=test&_profile=geoacdef&order_by=old`), 'https://example.org');
        assert.equal(url.searchParams.get('order_by'), 'https://schema.org/name');
        assert.equal(url.searchParams.get('order_by_direction'), 'ASC');
        assert.equal(url.searchParams.get('page'), String(page));
        assert.equal(url.searchParams.get('limit'), '2');
        assert.equal(url.searchParams.get('filter'), 'test');
        assert.equal(url.searchParams.get('_profile'), 'geoacdef');
    }
    const alternate = `${base}?_profile=altr-ext:alt-profile`;
    assert.equal(geoacListUrl(alternate), alternate);
    assert.equal(geoacListUrl('/catalogs?page=2'), '/catalogs?page=2');
});

test('ID comes from the IRI, while name comes from schema:name', () => {
    assert.equal(geoacIdentifier('http://ospd/demo/GA008'), 'GA008');
    assert.equal(geoacIdentifier('https://example.org/activities#buffer'), 'buffer');
    assert.equal(geoacName({
        value: 'http://ospd/demo/GA008', label: { value: 'Other label' },
        properties: { 'https://schema.org/name': { objects: [{ value: 'Band Calculation' }] } },
    }), 'Band Calculation');
});
