export const customPublishedProductFields = [];
export const customPublishedProductVariantFields = [];

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandler({ catalog }) {
  if (catalog) {
    const { publishedProductFields, publishedProductVariantFields } = catalog;
    if (Array.isArray(publishedProductFields)) {
      customPublishedProductFields.push(...publishedProductFields);
    }
    if (Array.isArray(publishedProductVariantFields)) {
      customPublishedProductVariantFields.push(...publishedProductVariantFields);
    }
  }
}
