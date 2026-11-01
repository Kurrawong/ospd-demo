import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activityTypeIdentifier, activityTypeListUrl, activityTypeName, isActivityTypeList } from '../app/utils/activityTypeList.ts';

const base = '/catalogs/reg:top/collections/reg:grassgis/items';

test('activity register listings receive the custom table', () => {
    for (const register of ['grassgis', 'hartis', 'ogc']) {
        const path = base.replace('reg:grassgis', `reg:${register}`);
        assert.ok(isActivityTypeList(path));
        assert.ok(isActivityTypeList(path.replaceAll(':', '%3A') + '/'));
    }
    assert.ok(!isActivityTypeList(`${base}/demo:GA001`));
    assert.ok(!isActivityTypeList('/catalogs/demo:models/collections/activitytype:/items'));
});

test('name ordering applies on every API page and preserves filters and profiles', () => {
    for (const page of [1, 2, 3]) {
        const url = new URL(activityTypeListUrl(`${base}?page=${page}&limit=2&filter=test&_profile=geoacdef&order_by=old`), 'https://example.org');
        assert.equal(url.searchParams.get('order_by'), 'https://schema.org/name');
        assert.equal(url.searchParams.get('order_by_direction'), 'ASC');
        assert.equal(url.searchParams.get('page'), String(page));
        assert.equal(url.searchParams.get('limit'), '2');
        assert.equal(url.searchParams.get('filter'), 'test');
        assert.equal(url.searchParams.get('_profile'), 'geoacdef');
    }
    const alternate = `${base}?_profile=altr-ext:alt-profile`;
    assert.equal(activityTypeListUrl(alternate), alternate);
    assert.equal(activityTypeListUrl('/catalogs?page=2'), '/catalogs?page=2');
});

test('ID comes from the IRI, while name comes from schema:name', () => {
    assert.equal(activityTypeIdentifier('http://ospd/demo/GA008'), 'GA008');
    assert.equal(activityTypeIdentifier('https://example.org/activities#buffer'), 'buffer');
    assert.equal(activityTypeName({
        value: 'http://ospd/demo/GA008', label: { value: 'Other label' },
        properties: { 'https://schema.org/name': { objects: [{ value: 'Band Calculation' }] } },
    }), 'Band Calculation');
});
