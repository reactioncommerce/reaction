export const sequenceConfigs = [];

/**
 * @summary aggregate various passed in pieces together
 * @param {Object} pluginPromotions - Extensions passed in via child plugins
 * @returns {undefined} undefined
 */
export function registerPluginHandlerForSequences({ sequenceConfigs: sequences }) {
  if (sequences) {
    sequenceConfigs.push(...sequences);
  }
}
