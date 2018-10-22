import { asyncForEach, pick, tagsByIds } from "./helpers";

/**
 * @summary Get shipping attributes for a fulfillment group
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} fulfillmentGroup - a fulfillment group for a shopping cart
 * @param {Object} fulfillmentGroup.address - the shipping address
 * @param {Array} fulfillmentGroup.items - the items in the cart
 * @returns {Object|null} shipping attributes for the provided fulfillment group
 */
export default async function getShippingAttributes(context, fulfillmentGroup) {
  const { collections } = context;
  const { address: destination, items } = fulfillmentGroup;
  const address = pick(destination, ["address1", "address2", "city", "country", "postal", "region"]);
  const products = [];

   await asyncForEach(items,(async (item) => {
    const product = pick(item, [
      "productId",
      "productVendor",
    ]);

    // Fetch product tags
    product.tags = await tagsByIds(collections, item.productTagIds); 

    // Add physical properties as top level props
    product.weight = item.parcel.weight;
    product.height = item.parcel.height;
    product.width = item.parcel.width;
    product.length = item.parcel.length;

    // TODO: fetch custom attributes

    products.push(product);
  }));

  return {
    address,
    items: products
  };
}
