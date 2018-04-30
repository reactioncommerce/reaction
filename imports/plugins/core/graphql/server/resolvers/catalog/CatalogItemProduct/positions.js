import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";

/**
 * @name "CatalogItemProduct.positions"
 * @method
 * @memberof Catalog/GraphQL
 * @summary Adjusts the positions prop of a product
 * @param {Object} product - CatalogProduct response from parent resolver
 * @return {Promise<Object[]>} Promise that resolves with an array of positions
 */
export default async function positions(product, _, context) {
  const { positions: productPositions } = product;
  if (!productPositions) return [];

  const { Shops, Tags } = context.collections;
  const positionTags = Object.keys(productPositions);
  const tagDocs = await Tags.find({ name: { $in: positionTags } }).toArray();

  return positionTags.map(async (tag) => {
    const tagDoc = tagDocs.find((doc) => doc.name === tag);
    let shop;
    if (!tagDoc) {
      // Tag name can also be the shop name lowercase
      shop = await Shops.findOne({ name: { $regex: new RegExp(`^${tag}$`, "i") } });
      if (!shop) throw new Error(`No tag or shop found with name "${tag}"`);
    }

    let tagId;
    if (tagDoc) {
      tagId = encodeTagOpaqueId(tagDoc._id);
    } else {
      tagId = encodeShopOpaqueId(shop._id);
    }

    const info = productPositions[tag];
    return {
      displayWeight: info.weight,
      isPinned: !!info.pinned,
      position: info.position || 1,
      tagId,
      updatedAt: info.updatedAt
    };
  });
}
