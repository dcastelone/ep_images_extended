// Modified from ep_image_insert 1.0.7 

'use strict';

const {buildDeliveryConfig} = require('./static/js/imageSource');

exports.loadSettings = (hookName, args, cb) => {
  // Sync ep_images_extended config into the runtime Settings singleton that other
  // parts of this plugin import, to avoid workspace/symlink doubletons.
  let runtimeSettings;
  try {
    const settingsModule = require('ep_etherpad-lite/node/utils/Settings');
    runtimeSettings = settingsModule.default || settingsModule;
  } catch (e) {
    console.warn('[ep_images_extended] Failed to sync settings:', e);
  }
  if (runtimeSettings && args && args.settings && args.settings.ep_images_extended) {
    // Throw on an invalid private-delivery contract so Etherpad does not start
    // in a configuration that stores branded URLs but cannot render them.
    buildDeliveryConfig(args.settings.ep_images_extended);
    runtimeSettings.ep_images_extended = args.settings.ep_images_extended;
  }

  if (!args.settings || !args.settings.socketIo) {
    console.warn('Please update Etherpad to >=1.8.8');
  } else {
    // Setting maxHttpBufferSize to 10 MiB :)
    args.settings.socketIo.maxHttpBufferSize = 100000000;
  }
  cb();
};
