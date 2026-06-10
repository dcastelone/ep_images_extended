'use strict';
// Modified from ep_image_insert 1.0.7 
const Changeset = require('ep_etherpad-lite/static/js/Changeset');
const Security = require('ep_etherpad-lite/static/js/security');

exports.getLineHTMLForExport = async (hook, context) => {
  const attribLine = context.attribLine;
  const apool = context.apool;

  if (!attribLine) return;

  let imgsHTML = '';
  const opIter = Changeset.opIterator(attribLine);

  while (opIter.hasNext()) {
    const op = opIter.next();
    const imageSrcAttrib = Changeset.opAttributeValue(op, 'image', apool);
    if (!imageSrcAttrib) continue;

    try {
      const decodedSrc = decodeURIComponent(imageSrcAttrib);
      if (!decodedSrc || (!decodedSrc.startsWith('data:') && !decodedSrc.startsWith('http') && !decodedSrc.startsWith('/'))) {
        console.warn(`[ep_images_extended exportHTML] Invalid image src: ${decodedSrc}`);
        continue;
      }

      const imageWidthAttrib = Changeset.opAttributeValue(op, 'image-width', apool);
      const imageHeightAttrib = Changeset.opAttributeValue(op, 'image-height', apool);
      const imageIdAttrib = Changeset.opAttributeValue(op, 'image-id', apool);

      let tag = `<img src="${Security.escapeHTML(decodedSrc)}"`;
      let styles = 'display:inline-block; max-width:100%; height:auto;';

      if (imageWidthAttrib) {
        tag += ` width="${Security.escapeHTMLAttribute(imageWidthAttrib.replace(/px$/, ''))}"`;
        styles += ` width:${Security.escapeHTMLAttribute(imageWidthAttrib)};`;
      }
      if (imageHeightAttrib) {
        tag += ` height="${Security.escapeHTMLAttribute(imageHeightAttrib.replace(/px$/, ''))}"`;
        styles = styles.replace('height:auto;', `height:${Security.escapeHTMLAttribute(imageHeightAttrib)};`);
      }
      if (imageIdAttrib) {
        tag += ` data-image-id="${Security.escapeHTMLAttribute(imageIdAttrib)}"`;
      }

      tag += ` style="${styles}">`;
      imgsHTML += tag;
    } catch (e) {
      console.error(`[ep_images_extended exportHTML] Error processing image: ${imageSrcAttrib}`, e);
    }
  }

  if (!imgsHTML) return; // no images found — leave lineContent untouched

  // Preserve alignment wrapper from ep_align if it ran before us
  const alignMatch = context.lineContent.match(/^<p style='text-align:([^']+)'>([\s\S]*)<\/p>$/);
  if (alignMatch) {
    context.lineContent = `<p style='text-align:${alignMatch[1]}'>${imgsHTML}</p>`;
  } else {
    context.lineContent = imgsHTML;
  }
};

exports.stylesForExport = (hook, padId, cb) => {
  cb('img { max-width: 100%; vertical-align: middle; }');
};
