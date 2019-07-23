import Logger from "@reactioncommerce/logger";
export const customPublishedProductFields = [];
export const customPublishedProductVariantFields = [];
export const customPublisherTransforms = [];

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandler({ catalog, functionsByType, name }) {
  if (Array.isArray(functionsByType.publishProductToCatalog) &&   functionsByType.publishProductToCatalog.length > 0) {
    Logger.warn(`Plugin ${name} is using the deprecated 'publishProductToCatalog' function by type. Use catalog.publisherTransforms instead.`);
  }

  if (catalog) {
    const { publishedProductFields, publishedProductVariantFields, publisherTransforms } = catalog;
    if (Array.isArray(publishedProductFields)) {
      customPublishedProductFields.push(...publishedProductFields);
    }
    if (Array.isArray(publishedProductVariantFields)) {
      customPublishedProductVariantFields.push(...publishedProductVariantFields);
    }
    if (Array.isArray(publisherTransforms)) {
      customPublisherTransforms.push(...publisherTransforms);
    }
  }
}
