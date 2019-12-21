import getRateObjectForRate from "@reactioncommerce/api-utils/getRateObjectForRate.js";
import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import ReactionError from "@reactioncommerce/reaction-error";
import { xformCatalogProductMedia } from "./catalogProduct";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";
import { decodeProductOpaqueId } from "./product";

export const assocCartInternalId = assocInternalId(namespaces.Cart);
export const assocCartOpaqueId = assocOpaqueId(namespaces.Cart);
export const decodeCartOpaqueId = decodeOpaqueIdForNamespace(namespaces.Cart);
export const encodeCartOpaqueId = encodeOpaqueId(namespaces.Cart);

export const assocCartItemInternalId = assocInternalId(namespaces.CartItem);
export const assocCartItemOpaqueId = assocOpaqueId(namespaces.CartItem);
export const decodeCartItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.CartItem);
export const encodeCartItemOpaqueId = encodeOpaqueId(namespaces.CartItem);

export const assocFulfillmentGroupInternalId = assocInternalId(namespaces.FulfillmentGroup);
export const assocFulfillmentGroupOpaqueId = assocOpaqueId(namespaces.FulfillmentGroup);
export const decodeFulfillmentGroupOpaqueId = decodeOpaqueIdForNamespace(namespaces.FulfillmentGroup);
export const encodeFulfillmentGroupOpaqueId = encodeOpaqueId(namespaces.FulfillmentGroup);

/**
 * @param {Object[]} items Array of CartItemInput
 * @returns {Object[]} Same array with all IDs transformed to internal
 */
export function decodeCartItemsOpaqueIds(items) {
  return items.map((item) => ({
    ...item,
    productConfiguration: {
      productId: decodeProductOpaqueId(item.productConfiguration.productId),
      productVariantId: decodeProductOpaqueId(item.productConfiguration.productVariantId)
    }
  }));
}

/**
 * @param {Object} context - an object containing the per-request state
 * @param {Object[]} catalogItems Array of CatalogItem docs from the db
 * @param {Object[]} products Array of Product docs from the db
 * @param {Object} cartItem CartItem
 * @returns {Object} Same object with GraphQL-only props added
 */
async function xformCartItem(context, catalogItems, products, cartItem) {
  const { productId, variantId } = cartItem;

  const catalogItem = catalogItems.find((cItem) => cItem.product.productId === productId);
  if (!catalogItem) {
    throw new ReactionError("not-found", `CatalogProduct with product ID ${productId} not found`);
  }

  const catalogProduct = catalogItem.product;

  const { variant } = context.queries.findVariantInCatalogProduct(catalogProduct, variantId);
  if (!variant) {
    throw new ReactionError("invalid-param", `Product with ID ${productId} has no variant with ID ${variantId}`);
  }

  // Find one image from the catalog to use for the item.
  // Prefer the first variant image. Fallback to the first product image.
  let media;
  if (variant.media && variant.media.length) {
    [media] = variant.media;
  } else if (catalogProduct.media && catalogProduct.media.length) {
    media = catalogProduct.media.find((mediaItem) => mediaItem.variantId === variantId);
    if (!media) [media] = catalogProduct.media;
  }

  // Allow plugins to transform the media object
  if (media) {
    media = await xformCatalogProductMedia(media, context);
  }

  return {
    ...cartItem,
    imageURLs: media && media.URLs,
    productConfiguration: {
      productId: cartItem.productId,
      productVariantId: cartItem.variantId
    }
  };
}

/**
 * @param {Object} context - an object containing the per-request state
 * @param {Object[]} items Array of CartItem
 * @returns {Object[]} Same array with GraphQL-only props added
 */
export async function xformCartItems(context, items) {
  const { collections, getFunctionsOfType } = context;
  const { Catalog, Products } = collections;

  const productIds = items.map((item) => item.productId);

  const catalogItems = await Catalog.find({
    "product.productId": {
      $in: productIds
    },
    "product.isVisible": true,
    "product.isDeleted": { $ne: true },
    "isDeleted": { $ne: true }
  }).toArray();

  const products = await Products.find({
    ancestors: {
      $in: productIds
    }
  }).toArray();

  const xformedItems = await Promise.all(items.map((item) => xformCartItem(context, catalogItems, products, item)));

  for (const mutateItems of getFunctionsOfType("xformCartItems")) {
    await mutateItems(context, xformedItems); // eslint-disable-line no-await-in-loop
  }

  return xformedItems;
}

/**
 * @summary Transform a single fulfillment group
 * @param {Object} fulfillmentGroup Fulfillment group
 * @param {Object} cart Full cart document, with items already transformed
 * @returns {Object} Transformed group
 */
function xformCartFulfillmentGroup(fulfillmentGroup, cart) {
  const availableFulfillmentOptions = (fulfillmentGroup.shipmentQuotes || []).map((option) => ({
    fulfillmentMethod: {
      _id: option.method._id,
      carrier: option.method.carrier || null,
      displayName: option.method.label || option.method.name,
      group: option.method.group || null,
      name: option.method.name,
      fulfillmentTypes: option.method.fulfillmentTypes
    },
    handlingPrice: {
      amount: option.handlingPrice || 0,
      currencyCode: cart.currencyCode
    },
    shippingPrice: {
      amount: option.shippingPrice || 0,
      currencyCode: cart.currencyCode
    },
    price: {
      amount: option.rate || 0,
      currencyCode: cart.currencyCode
    }
  }));

  let selectedFulfillmentOption = null;
  if (fulfillmentGroup.shipmentMethod) {
    selectedFulfillmentOption = {
      fulfillmentMethod: {
        _id: fulfillmentGroup.shipmentMethod._id,
        carrier: fulfillmentGroup.shipmentMethod.carrier || null,
        displayName: fulfillmentGroup.shipmentMethod.label || fulfillmentGroup.shipmentMethod.name,
        group: fulfillmentGroup.shipmentMethod.group || null,
        name: fulfillmentGroup.shipmentMethod.name,
        fulfillmentTypes: fulfillmentGroup.shipmentMethod.fulfillmentTypes
      },
      handlingPrice: {
        amount: fulfillmentGroup.shipmentMethod.handling || 0,
        currencyCode: cart.currencyCode
      },
      price: {
        amount: fulfillmentGroup.shipmentMethod.rate || 0,
        currencyCode: cart.currencyCode
      }
    };
  }

  return {
    _id: fulfillmentGroup._id,
    availableFulfillmentOptions,
    data: {
      shippingAddress: fulfillmentGroup.address
    },
    // For now, we only ever set one fulfillment group, so it has all of the items.
    // Revisit when the UI supports breaking into multiple groups.
    items: cart.items || [],
    selectedFulfillmentOption,
    shippingAddress: fulfillmentGroup.address,
    shopId: fulfillmentGroup.shopId,
    // For now, this is always shipping. Revisit when adding download, pickup, etc. types
    type: "shipping"
  };
}

/**
 * @param {Object} collections Map of Mongo collections
 * @param {Object} cart Cart document
 * @returns {Object} Checkout object
 */
export async function xformCartCheckout(collections, cart) {
  // itemTotal is qty * amount for each item, summed
  const itemTotal = (cart.items || []).reduce((sum, item) => (sum + item.subtotal.amount), 0);

  // shippingTotal is shipmentMethod.rate for each item, summed
  // handlingTotal is shipmentMethod.handling for each item, summed
  // If there are no selected shipping methods, fulfillmentTotal should be null
  let fulfillmentGroups = cart.shipping || [];
  let fulfillmentTotal = null;
  if (fulfillmentGroups.length > 0) {
    let shippingTotal = 0;
    let handlingTotal = 0;

    let hasNoSelectedShipmentMethods = true;
    fulfillmentGroups.forEach((fulfillmentGroup) => {
      if (fulfillmentGroup.shipmentMethod) {
        hasNoSelectedShipmentMethods = false;
        shippingTotal += fulfillmentGroup.shipmentMethod.rate || 0;
        handlingTotal += fulfillmentGroup.shipmentMethod.handling || 0;
      }
    });

    if (!hasNoSelectedShipmentMethods) {
      fulfillmentTotal = shippingTotal + handlingTotal;
    }
  }

  // Each item may have a total tax amount on it. We can sum these to get the total tax amount.
  // If any of them are null, we leave the total null also. Using for-of rather than reduce
  // so that we can set to null and break if we hit a not-yet-calculated item.
  let taxTotal = null;
  let taxableAmount = null;
  const { taxSummary } = cart;
  if (taxSummary) {
    ({ tax: taxTotal, taxableAmount } = taxSummary);
  }

  const discountTotal = cart.discount || 0;

  // surchargeTotal is sum of all surcharges is qty * amount for each item, summed
  const surchargeTotal = (cart.surcharges || []).reduce((sum, surcharge) => (sum + surcharge.amount), 0);

  const total = Math.max(0, itemTotal + fulfillmentTotal + taxTotal + surchargeTotal - discountTotal);

  let fulfillmentTotalMoneyObject = null;
  if (fulfillmentTotal !== null) {
    fulfillmentTotalMoneyObject = {
      amount: fulfillmentTotal,
      currencyCode: cart.currencyCode
    };
  }

  let taxTotalMoneyObject = null;
  let effectiveTaxRateObject = null;
  if (taxTotal !== null) {
    taxTotalMoneyObject = {
      amount: taxTotal,
      currencyCode: cart.currencyCode
    };
    if (taxSummary) {
      const effectiveTaxRate = taxSummary.tax / taxSummary.taxableAmount;
      effectiveTaxRateObject = getRateObjectForRate(effectiveTaxRate);
    }
  }

  fulfillmentGroups = fulfillmentGroups.map((fulfillmentGroup) => xformCartFulfillmentGroup(fulfillmentGroup, cart));
  fulfillmentGroups = fulfillmentGroups.filter((group) => !!group); // filter out nulls

  return {
    fulfillmentGroups,
    summary: {
      discountTotal: {
        amount: discountTotal,
        currencyCode: cart.currencyCode
      },
      effectiveTaxRate: effectiveTaxRateObject,
      fulfillmentTotal: fulfillmentTotalMoneyObject,
      itemTotal: {
        amount: itemTotal,
        currencyCode: cart.currencyCode
      },
      taxableAmount: {
        amount: taxableAmount,
        currencyCode: cart.currencyCode
      },
      taxTotal: taxTotalMoneyObject,
      surchargeTotal: {
        amount: surchargeTotal,
        currencyCode: cart.currencyCode
      },
      total: {
        amount: total,
        currencyCode: cart.currencyCode
      }
    }
  };
}

/**
 * @param {Object} collections Map of Mongo collections
 * @param {Object} items Cart items
 * @returns {Number} Total quantity of all items in the cart
 */
export async function xformTotalItemQuantity(collections, items) {
  // Total item quantity comes from the sum of the quantities of each item
  return (items || []).reduce((sum, item) => (sum + item.quantity), 0);
}
