'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {buildClientSettings} = require('../lib/clientSettings');

test('client settings expose delivery metadata but no storage or signer internals', () => {
  const client = buildClientSettings({
    storage: {
      type: 's3_presigned',
      bucket: 'private-bucket',
      region: 'us-east-1',
      publicURL: 'https://files.vhslearning.org/images/',
      credentials: 'must-not-leak',
    },
    delivery: {
      mode: 'signed_cookie',
      legacyBaseURLs: 'https://legacy.example/',
      privateKey: 'must-not-leak',
    },
    fileTypes: ['png'],
    maxFileSize: 1000,
    unrelatedServerSetting: 'must-not-leak',
  }, {png: {source: 'iana'}});

  assert.deepEqual(client, {
    storageType: 's3_presigned',
    delivery: {
      mode: 'signed_cookie',
      baseURL: 'https://files.vhslearning.org/images/',
      legacyBaseURLs: ['https://legacy.example/'],
    },
    mimeTypes: {png: {source: 'iana'}},
    fileTypes: ['png'],
    maxFileSize: 1000,
  });
  assert.equal(JSON.stringify(client).includes('must-not-leak'), false);
  assert.equal(JSON.stringify(client).includes('private-bucket'), false);
});
