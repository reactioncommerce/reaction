/**
 * @method getVariantIds
 * @memberof Core
 * @summary Get array of IDs of variants
 * @example getVariantIds(newVariantOrder)
 * @param  {Array} variants Array of variant objects
 * @return {Array}          Array of variant object IDs
 */
export const getVariantIds = (variants) => Array.isArray(variants) && variants.map((variant) => variant._id);
