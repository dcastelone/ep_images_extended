'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  applyImageAccessibility,
  decodeAltText,
  encodeAltText,
  getAltTextFromClasses,
} = require('../static/js/accessibility');

const fakeElement = (className = '') => {
  const attributes = new Map();
  const inner = {setAttribute: (key, value) => attributes.set(`inner:${key}`, value)};
  const handle = {setAttribute: (key, value) => attributes.set(`handle:${key}`, value)};
  return {
    className,
    attributes,
    setAttribute: (key, value) => attributes.set(key, value),
    removeAttribute: (key) => attributes.delete(key),
    querySelector: () => inner,
    querySelectorAll: () => [handle],
  };
};

test('alt text encoding round-trips Unicode and URL-unsafe bytes', () => {
  for (const value of ['', 'A useful diagram', 'Crème 日本語 😀', '+ / =']) {
    assert.equal(decodeAltText(encodeAltText(value)), value);
  }
  assert.equal(getAltTextFromClasses(`image:x image-alt-${encodeAltText('Chart')}`), 'Chart');
});

test('images receive an accessible name while implementation details are hidden', () => {
  const image = fakeElement(`inline-image image-alt-${encodeAltText('Enrollment chart')}`);
  applyImageAccessibility(image);
  assert.equal(image.attributes.get('role'), 'img');
  assert.equal(image.attributes.get('aria-label'), 'Enrollment chart');
  assert.equal(image.attributes.get('tabindex'), '0');
  assert.equal(image.attributes.get('inner:aria-hidden'), 'true');
  assert.equal(image.attributes.get('handle:tabindex'), '-1');
});

test('empty alt text produces an explicit decorative label', () => {
  const image = fakeElement('inline-image');
  applyImageAccessibility(image);
  assert.equal(image.attributes.get('aria-label'), 'Decorative image');
});
