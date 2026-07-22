'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const ep = require('../ep.json');
const pkg = require('../package.json');

test('font-size integration is ordered without becoming a package dependency', () => {
  assert.ok(ep.parts[0].pre.includes('ep_font_size/main'));
  assert.equal(pkg.dependencies?.ep_font_size, undefined);
  assert.equal(pkg.peerDependencies?.ep_font_size, undefined);
  assert.equal(pkg.optionalDependencies?.ep_font_size, undefined);
});
