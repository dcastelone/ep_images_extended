'use strict';

const SIGNED_COOKIE_MODE = 'signed_cookie';

const asBaseURL = (value) => {
  if (typeof value !== 'string' || value.trim() === '') return null;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    parsed.search = '';
    parsed.hash = '';
    if (!parsed.pathname.endsWith('/')) parsed.pathname += '/';
    return parsed.toString();
  } catch (_) {
    return null;
  }
};

const parseLegacyBaseURLs = (value) => {
  const candidates = Array.isArray(value) ? value :
    typeof value === 'string' ? value.split(',') : [];
  return [...new Set(candidates.map(asBaseURL).filter(Boolean))];
};

const buildDeliveryConfig = (pluginSettings = {}) => {
  const configured = pluginSettings.delivery || {};
  const mode = configured.mode === SIGNED_COOKIE_MODE ? SIGNED_COOKIE_MODE : 'public';
  if (mode !== SIGNED_COOKIE_MODE) return {mode: 'public'};

  const baseURL = asBaseURL(configured.baseURL || pluginSettings.storage?.publicURL);
  if (!baseURL) {
    throw new Error('ep_images_extended signed_cookie delivery requires an HTTP(S) baseURL');
  }

  return {
    mode,
    baseURL,
    legacyBaseURLs: parseLegacyBaseURLs(configured.legacyBaseURLs),
  };
};

const rewriteImageSource = (source, delivery = {}) => {
  if (delivery.mode !== SIGNED_COOKIE_MODE || typeof source !== 'string') return source;
  if (source.startsWith('data:') || source.startsWith('/')) return source;

  let sourceURL;
  let targetBase;
  try {
    sourceURL = new URL(source);
    targetBase = new URL(delivery.baseURL);
  } catch (_) {
    return source;
  }

  if (sourceURL.origin === targetBase.origin && sourceURL.pathname.startsWith(targetBase.pathname)) {
    return source;
  }

  for (const legacyValue of delivery.legacyBaseURLs || []) {
    let legacyBase;
    try {
      legacyBase = new URL(legacyValue);
    } catch (_) {
      continue;
    }
    if (sourceURL.origin !== legacyBase.origin ||
        !sourceURL.pathname.startsWith(legacyBase.pathname)) continue;

    const relativePath = sourceURL.pathname.slice(legacyBase.pathname.length);
    const rewritten = new URL(relativePath, targetBase);
    rewritten.search = sourceURL.search;
    rewritten.hash = sourceURL.hash;
    return rewritten.toString();
  }
  return source;
};

module.exports = {
  SIGNED_COOKIE_MODE,
  asBaseURL,
  buildDeliveryConfig,
  parseLegacyBaseURLs,
  rewriteImageSource,
};
