import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registerApiUrl, registerUiUrl } from '../app/utils/registerRoutes.ts';

test('root registers use the catalog API with ordering before pagination', () => {
    const url = new URL(registerApiUrl('/registers?page=2&limit=50'), 'http://localhost');
    assert.equal(url.pathname, '/catalogs');
    assert.equal(url.searchParams.get('page'), '2');
    assert.equal(url.searchParams.get('limit'), '50');
    assert.equal(url.searchParams.get('order_by'), 'https://schema.org/name');
    assert.equal(url.searchParams.get('order_by_direction'), 'ASC');
    const alternate = new URL(registerApiUrl('/registers?_profile=altr-ext:alt-profile'), 'http://localhost');
    assert.equal(alternate.searchParams.get('_profile'), 'altr-ext:alt-profile');
    assert.equal(alternate.searchParams.has('order_by'), false);
});

test('only root UI routes change; nested catalog URLs remain stable', () => {
    assert.equal(registerUiUrl('/catalogs?page=2'), '/registers?page=2');
    const nested = '/catalogs/demo:models/collections/activitytype:';
    assert.equal(registerUiUrl(nested), nested);
    assert.equal(registerApiUrl(nested), nested);
});
