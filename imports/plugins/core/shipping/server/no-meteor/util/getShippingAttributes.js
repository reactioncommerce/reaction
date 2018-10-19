import { pick } from "./helpers";

/**
 * @summary Get shipping attributes for a fulfillment group
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} fulfillmentGroup - a fulfillment group for a shopping cart
 * @param {Object} fulfillmentGroup.address - the shipping address
 * @param {Array} fulfillmentGroup.items - the items in the cart
 * @returns {Object|null} shipping attributes for the provided fulfillment group
 */
export default async function getShippingAttributes(context, fulfillmentGroup) {
  // console.log("fulfillmentGroup", fulfillmentGroup);
  const { address: destination, items } = fulfillmentGroup;

  const address = pick(destination, ["address1", "address2", "city", "country", "postal", "region"]);

  const products = [];

  items.forEach((item) => {
    const product = pick(item, [
      "productId",
      "productVendor",
    ]);

    // const tags = await context.queries.tagsByIds(context, item.productTagIds);
    // console.log("tags", tags);
    

    // Add physical properties as top level props
    product.weight = item.parcel.weight;
    product.height = item.parcel.height;
    product.width = item.parcel.width;
    product.length = item.parcel.length;

    // TODO: fetch tags

    // TODO: fetch custom attributes

    products.push(product);
  })

  const data = {
    address,
    items: products
  };

  console.log("data", data);

  return data;
}
