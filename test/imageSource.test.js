'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  buildDeliveryConfig,
  rewriteImageSource,
} = require('../static/js/imageSource');

test('public delivery preserves every image source', () => {
  const config = buildDeliveryConfig({delivery: {mode: 'public'}});
  assert.deepEqual(config, {mode: 'public'});
  assert.equal(
    rewriteImageSource('https://legacy.example/image.jpg', config),
    'https://legacy.example/image.jpg'
  );
});

test('signed-cookie delivery normalizes configured bases and legacy lists', () => {
  const config = buildDeliveryConfig({
    storage: {publicURL: 'https://files.vhslearning.org/images'},
    delivery: {
      mode: 'signed_cookie',
      legacyBaseURLs: 'https://old-one.example, https://old-two.example/prefix/',
    },
  });
  assert.deepEqual(config, {
    mode: 'signed_cookie',
    baseURL: 'https://files.vhslearning.org/images/',
    legacyBaseURLs: [
      'https://old-one.example/',
      'https://old-two.example/prefix/',
    ],
  });
});

test('legacy CloudFront sources render through the branded image path without mutating content', () => {
  const config = buildDeliveryConfig({
    delivery: {
      mode: 'signed_cookie',
      baseURL: 'https://files.vhslearning.org/images/',
      legacyBaseURLs: ['https://d111111abcdef8.cloudfront.net/'],
    },
  });
  assert.equal(
    rewriteImageSource(
      'https://d111111abcdef8.cloudfront.net/g.pad%24name/image.jpg?version=2#preview',
      config
    ),
    'https://files.vhslearning.org/images/g.pad%24name/image.jpg?version=2#preview'
  );
});

test('branded, external, relative, and data sources are unchanged', () => {
  const config = buildDeliveryConfig({
    delivery: {
      mode: 'signed_cookie',
      baseURL: 'https://files.vhslearning.org/images/',
      legacyBaseURLs: ['https://legacy.example/'],
    },
  });
  for (const source of [
    'https://files.vhslearning.org/images/pad/image.png',
    'https://external.example/image.png',
    '/static/image.png',
    'data:image/png;base64,AAAA',
  ]) assert.equal(rewriteImageSource(source, config), source);
});

test('signed-cookie mode rejects a missing or non-HTTP branded base', () => {
  assert.throws(
    () => buildDeliveryConfig({delivery: {mode: 'signed_cookie'}}),
    /requires an HTTP\(S\) baseURL/
  );
  assert.throws(
    () => buildDeliveryConfig({delivery: {mode: 'signed_cookie', baseURL: 'file:///tmp/images'}}),
    /requires an HTTP\(S\) baseURL/
  );
});
