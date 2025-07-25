'use strict';
// Modified from ep_image_insert 1.0.7 
const eejs = require('ep_etherpad-lite/node/eejs/');

exports.eejsBlock_editbarMenuLeft = (hookName, args, cb) => {
  if (args.renderContext.isReadOnly) return cb();
  // There is a way to do this with classes too using acl-write I think?
  args.content += eejs.require('ep_images_extended/templates/editbarButton.ejs');
  return cb();
};
