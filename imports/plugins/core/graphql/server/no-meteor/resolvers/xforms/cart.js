import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import ReactionError from "@reactioncommerce/reaction-error";
import findVariantInCatalogProduct from "/imports/plugins/core/catalog/server/no-meteor/utils/findVariantInCatalogProduct";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";
import { decodeProductOpaqueId } from "./product";
import { xformProductMedia } from "./catalogProduct";

export const assocCartInternalId = assocInternalId(namespaces.Cart);
export const assocCartOpaqueId = assocOpaqueId(namespaces.Cart);
export const decodeCartOpaqueId = decodeOpaqueIdForNamespace(namespaces.Cart);
export const encodeCartOpaqueId = encodeOpaqueId(namespaces.Cart);

export const assocCartItemInternalId = assocInternalId(namespaces.CartItem);
export const assocCartItemOpaqueId = assocOpaqueId(namespaces.CartItem);
export const decodeCartItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.CartItem);
export const encodeCartItemOpaqueId = encodeOpaqueId(namespaces.CartItem);

export const assocCartPaymentInternalId = assocInternalId(namespaces.CartPayment);
export const assocCartPaymentOpaqueId = assocOpaqueId(namespaces.CartPayment);
export const decodeCartPaymentOpaqueId = decodeOpaqueIdForNamespace(namespaces.CartPayment);
export const encodeCartPaymentOpaqueId = encodeOpaqueId(namespaces.CartPayment);

export const assocFulfillmentGroupInternalId = assocInternalId(namespaces.FulfillmentGroup);
export const assocFulfillmentGroupOpaqueId = assocOpaqueId(namespaces.FulfillmentGroup);
export const decodeFulfillmentGroupOpaqueId = decodeOpaqueIdForNamespace(namespaces.FulfillmentGroup);
export const encodeFulfillmentGroupOpaqueId = encodeOpaqueId(namespaces.FulfillmentGroup);

/**
 * @param {Object[]} items Array of CartItemInput
 * @return {Object[]} Same array with all IDs transformed to internal
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
 * @param {Object[]} catalogItems Array of CatalogItem docs from the db
 * @param {Object[]} products Array of Product docs from the db
 * @param {Object} cartItem CartItem
 * @return {Object} Same object with GraphQL-only props added
 */
function xformCartItem(catalogItems, products, cartItem) {
  const { priceWhenAdded, productId, variantId } = cartItem;
  const { currencyCode } = priceWhenAdded;

  const catalogItem = catalogItems.find((cItem) => cItem.product.productId === productId);
  if (!catalogItem) {
    throw new ReactionError("not-found", `CatalogProduct with product ID ${productId} not found`);
  }

  const catalogProduct = catalogItem.product;
  const { variant } = findVariantInCatalogProduct(catalogProduct, variantId);
  if (!variant) {
    throw new ReactionError("invalid-param", `Product with ID ${productId} has no variant with ID ${variantId}`);
  }

  const variantPriceInfo = variant.pricing[currencyCode];
  if (!variantPriceInfo) {
    throw new ReactionError("invalid-param", `This product variant does not have a price for ${currencyCode}`);
  }

  let media;
  if (catalogProduct.media) {
    media = catalogProduct.media.find((mediaItem) => mediaItem.variantId === variantId);
    if (!media) [media] = catalogProduct.media;
    media = xformProductMedia(media);
  }

  const variantSourceProduct = products.find((product) => product._id === variantId);

  return {
    ...cartItem,
    compareAtPrice: {
      amount: variantPriceInfo.compareAtPrice,
      currencyCode
    },
    currentQuantity: variantSourceProduct && variantSourceProduct.inventoryQuantity,
    imageURLs: media && media.URLs,
    isBackorder: variant.isBackorder || false,
    isLowQuantity: variant.isLowQuantity || false,
    isSoldOut: variant.isSoldOut || false,
    price: {
      amount: variantPriceInfo.price,
      currencyCode
    },
    productConfiguration: {
      productId: cartItem.productId,
      productVariantId: cartItem.variantId
    }
  };
}

/**
 * @param {Object} collections Map of raw collections
 * @param {Object[]} items Array of CartItem
 * @return {Object[]} Same array with GraphQL-only props added
 */
export async function xformCartItems(collections, items) {
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

  return items.map((item) => xformCartItem(catalogItems, products, item));
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
      // For now, this is always shipping. Revisit when adding download, pickup, etc. types
      fulfillmentTypes: ["shipping"]
    },
    handlingPrice: {
      amount: option.handling || 0,
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
        // For now, this is always shipping. Revisit when adding download, pickup, etc. types
        fulfillmentTypes: ["shipping"]
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
    // For now, this is always shipping. Revisit when adding download, pickup, etc. types
    type: "shipping"
  };
}

/**
 * @summary Transform a single fulfillment group
 * @param {Object} payment A payment object
 * @param {Object} cart Full cart document, with items already transformed
 * @param {Number} cartTotal The calculated total price of the cart
 * @param {Object[]} paymentMethods Payment method packages
 * @returns {Object} Transformed payment
 */
function xformCartPayments(payment, cart, cartTotal, paymentMethods) {
  const { _id, address, paymentMethod } = payment;

  if (!paymentMethod) return null;

  // Get the name, since only the ID is stored right now
  const paymentMethodPkg = paymentMethods.find((method) => method._id === paymentMethod.paymentPackageId);
  let methodName = paymentMethodPkg && paymentMethodPkg.name;
  if (typeof methodName === "string") methodName = methodName.replace(/-/g, "");

  return {
    _id,
    amount: {
      amount: paymentMethod.amount,
      currencyCode: cart.currencyCode
    },
    createdAt: paymentMethod.createdAt,
    data: {
      methodName, // GraphQL resolver uses this to figure out which of the union types this is
      billingAddress: address
    },
    displayName: paymentMethod.storedCard || "",
    isAuthorized: (paymentMethod.status === "created" && paymentMethod.mode === "authorize"),
    method: {
      name: methodName,
      data: {
        methodName, // GraphQL resolver uses this to figure out which of the union types this is
        example: "example"
      }
    }
  };
}

/**
 * @param {Object} collections Map of Mongo collections
 * @param {Object} cart Cart document
 * @returns {Object} Checkout object
 */
export async function xformCartCheckout(collections, cart) {
  // itemTotal is qty * amount for each item, summed
  const itemTotal = (cart.items || []).reduce((sum, item) => (sum + (item.quantity * item.priceWhenAdded.amount)), 0);

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

  // taxTotal is itemTotal * effective tax ratio
  // If it's null or undefined, we assume it has not been calculated and keep as null.
  let taxTotal = null;
  if (typeof cart.tax === "number") {
    taxTotal = itemTotal * cart.tax;
  }

  const discountTotal = cart.discount || 0;

  const total = Math.max(0, itemTotal + fulfillmentTotal + taxTotal - discountTotal);

  let fulfillmentTotalMoneyObject = null;
  if (fulfillmentTotal !== null) {
    fulfillmentTotalMoneyObject = {
      amount: fulfillmentTotal,
      currencyCode: cart.currencyCode
    };
  }

  let taxTotalMoneyObject = null;
  if (taxTotal !== null) {
    taxTotalMoneyObject = {
      amount: taxTotal,
      currencyCode: cart.currencyCode
    };
  }

  fulfillmentGroups = fulfillmentGroups.map((fulfillmentGroup) => xformCartFulfillmentGroup(fulfillmentGroup, cart));
  fulfillmentGroups = fulfillmentGroups.filter((payment) => !!payment); // filter out nulls

  // Get packages providing payment methods for the cart shop.
  // Convert them into a map of package IDs to names.
  // We only need to do this because only the ID is stored in the cart
  // but GraphQL needs the name. We should update to store the method name eventually.
  const paymentMethods = await collections.Packages.find({
    "registry.provides": "paymentMethod",
    "shopId": cart.shopId
  }).toArray();

  let payments = (cart.billing || []).map((payment) => xformCartPayments(payment, cart, total, paymentMethods));
  payments = payments.filter((payment) => !!payment); // filter out nulls

  return {
    fulfillmentGroups,
    payments,
    summary: {
      discountTotal: {
        amount: discountTotal,
        currencyCode: cart.currencyCode
      },
      fulfillmentTotal: fulfillmentTotalMoneyObject,
      itemTotal: {
        amount: itemTotal,
        currencyCode: cart.currencyCode
      },
      taxTotal: taxTotalMoneyObject,
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
