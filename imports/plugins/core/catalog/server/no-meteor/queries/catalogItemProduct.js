import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name catalogItemProduct
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Catalog for a single Product by id or slug
 * id takes priority if both are provided, throws meteor error if neither
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} [params._id] - Product id to include
 * @param {String} [param.slug] - Product slug (handle)
 * @returns {Object} - A Product from the Catalog
 */
export default async function catalogItemProduct(context, { _id, slug } = {}) {
  const { collections } = context;
  const { Catalog } = collections;

  if (!_id && !slug) {
    throw new ReactionError("invalid-param", "You must provide a product slug or product id");
  }

  const query = {
    "product.isDeleted": { $ne: true },
    "product.isVisible": true
  };

  if (_id) {
    query._id = _id;
  } else {
    query["product.slug"] = slug;
  }

  return Catalog.findOne(query);
}
