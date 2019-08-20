/**
 * @summary Calls through to registered "xformCatalogProductVariants" functions
 *   that may mutate the CatalogProductVariant list.
 * @param {Object} context App context
 * @param {Object[]} catalogProductVariants An array of CatalogProductVariant objects
 * @param {Object} [info] Additional info
 * @returns {Object[]} Returns potentially mutated catalogProductVariants so that this
 *   can be used as a resolver.
 */
export default async function xformCatalogProductVariants(context, catalogProductVariants, info = {}) {
  const { getFunctionsOfType } = context;

  for (const mutateVariants of getFunctionsOfType("xformCatalogProductVariants")) {
    await mutateVariants(context, catalogProductVariants, info); // eslint-disable-line no-await-in-loop
  }

  return catalogProductVariants;
}
