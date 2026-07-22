'use strict';

const {buildDeliveryConfig} = require('../static/js/imageSource');

const buildClientSettings = (pluginSettings = {}, mimeTypes = {}) => {
  const clientSettings = {
    storageType: pluginSettings.storage?.type || 'local',
    delivery: buildDeliveryConfig(pluginSettings),
    mimeTypes,
  };
  if (pluginSettings.fileTypes) clientSettings.fileTypes = pluginSettings.fileTypes;
  if (pluginSettings.maxFileSize) clientSettings.maxFileSize = pluginSettings.maxFileSize;
  return clientSettings;
};

module.exports = {buildClientSettings};
