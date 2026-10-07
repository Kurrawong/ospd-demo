import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registerStatus, registerListUrl } from '../app/utils/registerStatus.ts';
const path = '/catalogs/reg:top/collections/reg:grassgis/items';
const iri = 'http://w3id.org/ogc/reg/grassgis';
const statement = (register, status, links) => ({ properties: {
    'https://schema.org/memberOf': { objects: [{ value: register, links }] },
    'https://schema.org/value': { objects: [{ value: status }] },
} });
const item = { properties: { 'http://example.org/qualifiedStatus': { objects: [
    statement('http://w3id.org/ogc/reg/hartis', 'other-status'),
    statement(iri, 'correct-status', [{ value: path.replace('/items', '') }]),
] } } };
test('selects only status belonging to the current register, by IRI or API link', () => {
    assert.deepEqual(registerStatus(item, path, iri), [{ value: 'correct-status' }]);
    assert.deepEqual(registerStatus(item, path.replaceAll(':', '%3A')), [{ value: 'correct-status' }]);
    assert.deepEqual(registerStatus(item, '/catalogs/reg:top/collections/reg:missing/items'), []);
});
test('requests qualified-status listing data while retaining pagination and explicit profiles', () => {
    const url = new URL(registerListUrl(path + '?page=2&limit=10'), 'http://localhost');
    assert.equal(url.searchParams.get('_profile'), 'prez:OGCListingProfile');
    assert.equal(url.searchParams.get('page'), '2');
    assert.equal(registerListUrl(path + '?_profile=altr-ext:alt-profile'), path + '?_profile=altr-ext:alt-profile');
    assert.equal(registerListUrl('/catalogs/demo:models/collections'), '/catalogs/demo:models/collections');
});
