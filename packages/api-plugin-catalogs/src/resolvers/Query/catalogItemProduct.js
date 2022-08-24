import { decodeCatalogItemOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query.catalogItemProduct
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a CatalogItemProduct from the Catalog
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - shop ID for catalog item product
 * @param {String} args.slugOrId - slug or id for catalog item product
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} A CatalogItemProduct object
 */
export default async function catalogItemProduct(_, args, context) {
  const { shopId: opaqueShopId, slugOrId } = args;

  const catalogIdOrProductSlug = decodeCatalogItemOpaqueId(slugOrId);

  let shopId;
  if (opaqueShopId) {
    shopId = decodeShopOpaqueId(opaqueShopId);
  }

  return context.queries.catalogItemProduct(context, {
    catalogIdOrProductSlug,
    shopId
  });
}
