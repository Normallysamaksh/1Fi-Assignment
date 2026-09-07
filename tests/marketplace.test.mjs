import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  quote,
  validateSelection,
  startingPrice,
  fetchCatalog,
} from '../lib/marketplace.ts';

const catalog = JSON.parse(
  readFileSync(new URL('../public/data/catalog.json', import.meta.url), 'utf8'),
);
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('every product has a real local image and an available variant', () => {
  for (const p of catalog.products) {
    assert.ok(
      p.variants.some((v) => v.available),
      p.id,
    );
    assert.ok(
      existsSync(new URL('../public' + p.image, import.meta.url)),
      p.image,
    );
    assert.ok(startingPrice(p) > 0);
  }
});
test('every EMI schedule reconciles exactly to the product price in paise', () => {
  for (const product of catalog.products)
    for (const variant of product.variants)
      for (const plan of catalog.plans) {
        const p = quote(variant.price, plan);
        assert.equal(
          Math.round(p.monthly * 100) * (plan.months - 1) +
            Math.round(p.finalPayment * 100),
          Math.round(variant.price * 100),
        );
        assert.equal(p.total, variant.price);
      }
});
test('rounding remainder belongs to the final payment', () => {
  const p = quote(100, {
    id: 'three',
    months: 3,
    interestPercent: 0,
    processingFee: 0,
  });
  assert.equal(p.monthly, 33.33);
  assert.equal(p.finalPayment, 33.34);
  assert.equal(p.total, 100);
});
test('price changes update the same selected EMI plan', () => {
  const a = validateSelection(catalog, 'iphone-16', '128', 'emi-12');
  const b = validateSelection(catalog, 'iphone-16', '256', 'emi-12');
  assert.equal(a.payment.total, 69900);
  assert.equal(b.payment.total, 79900);
  assert.ok(b.payment.monthly > a.payment.monthly);
});
test('unavailable or unknown selections cannot be confirmed', () => {
  assert.throws(
    () => validateSelection(catalog, 'iphone-16', '512', 'emi-12'),
    /out of stock/,
  );
  assert.throws(
    () => validateSelection(catalog, 'missing', '128', 'emi-12'),
    /no longer available/,
  );
  assert.throws(
    () => validateSelection(catalog, 'iphone-16', '128', 'missing'),
    /no longer available/,
  );
});
test('invalid financial input is rejected', () => {
  const plan = catalog.plans[0];
  for (const price of [-1, NaN, Infinity])
    assert.throws(() => quote(price, plan));
  for (const months of [0, -1, 1.5, 61])
    assert.throws(() => quote(100, { ...plan, months }));
});
test('catalogue loads from the replaceable data endpoint', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/data/catalog.json');
    assert.ok(options);
    return new Response(JSON.stringify(catalog));
  };
  assert.deepEqual(await fetchCatalog(), catalog);
});
test('failed responses and malformed data produce a retryable error', async () => {
  globalThis.fetch = async () => new Response('', { status: 503 });
  await assert.rejects(fetchCatalog(), /try again/);
  globalThis.fetch = async () => new Response('{}');
  await assert.rejects(fetchCatalog(), /try again/);
});
test('request cancellation passes through to fetch', async () => {
  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = async (_, { signal }) => {
    assert.equal(signal, controller.signal);
    signal.throwIfAborted();
  };
  await assert.rejects(fetchCatalog(controller.signal), { name: 'AbortError' });
});
