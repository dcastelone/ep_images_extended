'use strict';

const encodeAltText = (value = '') => {
  const text = String(value || '');
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  return Buffer.from(text, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const decodeAltText = (value = '') => {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
    if (typeof atob === 'function') return decodeURIComponent(escape(atob(padded)));
    return Buffer.from(padded, 'base64').toString('utf8');
  } catch (_) {
    return '';
  }
};

const getAltTextFromClasses = (className = '') => {
  for (const cls of String(className).split(/\s+/)) {
    if (cls.startsWith('image-alt-')) return decodeAltText(cls.slice('image-alt-'.length));
  }
  return '';
};

const applyImageAccessibility = (outerSpan) => {
  if (!outerSpan) return;
  const altText = getAltTextFromClasses(outerSpan.className || '');
  const isDecorative = altText.trim() === '';

  outerSpan.setAttribute('contenteditable', 'false');
  outerSpan.setAttribute('tabindex', '0');
  outerSpan.setAttribute('aria-roledescription', 'image');

  outerSpan.setAttribute('role', 'img');
  outerSpan.setAttribute('aria-label', isDecorative ? 'Decorative image' : altText);
  outerSpan.removeAttribute('aria-hidden');

  const innerSpan = outerSpan.querySelector && outerSpan.querySelector('span.image-inner');
  if (innerSpan) {
    innerSpan.setAttribute('contenteditable', 'false');
    innerSpan.setAttribute('aria-hidden', 'true');
  }

  for (const handle of outerSpan.querySelectorAll ? outerSpan.querySelectorAll('.image-resize-handle') : []) {
    handle.setAttribute('aria-hidden', 'true');
    handle.setAttribute('contenteditable', 'false');
    handle.setAttribute('tabindex', '-1');
  }
};

const promptForAltText = (fileName = '') => {
  if (typeof window === 'undefined' || typeof window.prompt !== 'function') return '';
  const hint = fileName ? ` for ${fileName}` : '';
  const value = window.prompt(`Describe this image${hint}. Leave blank if it is decorative.`, '');
  return value == null ? '' : value.trim();
};

module.exports = {
  applyImageAccessibility,
  decodeAltText,
  encodeAltText,
  getAltTextFromClasses,
  promptForAltText,
};
