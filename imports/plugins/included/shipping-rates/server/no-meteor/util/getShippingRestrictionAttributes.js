import { getCatalogProducts, pick, tagsByIds } from "./helpers";

/**
 * @name getShippingRestrictionAttributes
 * @summary Get shipping attributes for a fulfillment group that will be used to
 * determine any applicable shipping restrictions.
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} fulfillmentGroup - a fulfillment group for a shopping cart
 * @param {Object} fulfillmentGroup.address - the shipping address
 * @param {Array} fulfillmentGroup.items - the items in the cart
 * @returns {Object|null} shipping restriction attributes for the provided fulfillment group
 */
export default async function getShippingRestrictionAttributes(context, fulfillmentGroup) {
  const { collections, getFunctionsOfType } = context;
  const { address: destination, items } = fulfillmentGroup;
  const address = pick(destination, ["address1", "address2", "city", "country", "postal", "region"]);
  const products = [];

  // Products in the Catalog collection are the source of truth, therefore use them
  // as the source of data instead of what is coming from the client.
  const catalogProducts = await getCatalogProducts(collections, items);
  const tags = await tagsByIds(collections, catalogProducts)

  for (const orderLineItem of items ) {
    const { product: catalogProduct } = catalogProducts.find(catProduct => {
      return catProduct.product.productId === orderLineItem.productId;
    });

    if (!catalogProduct) {
      throw ("Catalog product not found");
    }

    const product = pick(catalogProduct, [
      "productId",
      "vendor",
    ]);

    // Fetch product tags
    tags.find(tag => {
      if (tag.productId === product.productId) {
        product.tags = tag.tags;
      }
    });

    // Add physical properties as top level props
    if (catalogProduct.parcel) {
      product.weight = catalogProduct.parcel.weight;
      product.height = catalogProduct.parcel.height;
      product.width = catalogProduct.parcel.width;
      product.length = catalogProduct.parcel.length;
    }

    // fetch custom shipping restrictions attributes for the variant in the shopping cart
    const variant = catalogProduct.variants.find(variant => variant._id === orderLineItem.variantId);
    getFunctionsOfType("addShippingRestrictionCustomAttributes").forEach((customAttributesFunc) => {
      customAttributesFunc(product, { variant });
    })

    products.push(product);
  };

  return {
    address,
    items: products
  };
}
