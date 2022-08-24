import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name catalogItemProduct
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Catalog for a single Product by id or slug
 * id takes priority if both are provided, throws meteor error if neither
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} [param.catalogIdOrProductSlug] - Catalog item ID or Product slug (handle)
 * @param {String} [param.shopId] - ID of shop that owns the product
 * @returns {Object} - A Product from the Catalog
 */
export default async function catalogItemProduct(context, { catalogIdOrProductSlug, shopId } = {}) {
  const { collections } = context;
  const { Catalog } = collections;

  if (!catalogIdOrProductSlug) {
    throw new ReactionError("invalid-param", "You must provide a product slug or product id");
  }

  const query = {
    "product.isDeleted": { $ne: true },
    "product.isVisible": true,
    "$or": [
      {
        _id: catalogIdOrProductSlug
      },
      {
        "product.slug": catalogIdOrProductSlug
      }
    ]
  };

  if (shopId) {
    query.shopId = shopId;
  }

  return Catalog.findOne(query);
}
