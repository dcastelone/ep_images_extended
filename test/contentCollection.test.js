'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {encodeAltText} = require('../static/js/accessibility');
const {collectContentPre} = require('../static/js/contentCollection');

const collect = (cls) => {
  const attributes = [];
  collectContentPre('collectContentPre', {
    cls,
    state: {},
    cc: {doAttrib: (_state, attribute) => attributes.push(attribute)},
  });
  return attributes;
};

test('mixed image metadata survives content collection', () => {
  assert.deepEqual(collect([
    'image:https%3A%2F%2Fexample.com%2Fimage.png',
    'image-width:50%',
    'image-height:auto',
    'imageCssAspectRatio:1.5',
    'image-float:right',
    'image-id-12345678901',
    `image-alt-${encodeAltText('Results chart')}`,
  ].join(' ')), [
    'image::https%3A%2F%2Fexample.com%2Fimage.png',
    'image-width::50%',
    'image-height::auto',
    'imageCssAspectRatio::1.5',
    'image-float::right',
    'image-id::12345678901',
    'image-alt::Results chart',
  ]);
});

test('invalid dimensions, float, ratio, and short IDs are discarded', () => {
  assert.deepEqual(collect('image-width:expression(x) image-height:-1px imageCssAspectRatio:nope image-float:fixed image-id-short'), []);
});
