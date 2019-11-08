import ReactionError from "@reactioncommerce/reaction-error";
import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { xformCatalogProductMedia } from "./catalogProduct";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocOrderInternalId = assocInternalId(namespaces.Order);
export const assocOrderOpaqueId = assocOpaqueId(namespaces.Order);
export const decodeOrderOpaqueId = decodeOpaqueIdForNamespace(namespaces.Order);
export const encodeOrderOpaqueId = encodeOpaqueId(namespaces.Order);

export const assocOrderFulfillmentGroupInternalId = assocInternalId(namespaces.OrderFulfillmentGroup);
export const assocOrderFulfillmentGroupOpaqueId = assocOpaqueId(namespaces.OrderFulfillmentGroup);
export const decodeOrderFulfillmentGroupOpaqueId = decodeOpaqueIdForNamespace(namespaces.OrderFulfillmentGroup);
export const encodeOrderFulfillmentGroupOpaqueId = encodeOpaqueId(namespaces.OrderFulfillmentGroup);

export const assocOrderItemInternalId = assocInternalId(namespaces.OrderItem);
export const assocOrderItemOpaqueId = assocOpaqueId(namespaces.OrderItem);
export const decodeOrderItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.OrderItem);
export const encodeOrderItemOpaqueId = encodeOpaqueId(namespaces.OrderItem);

/**
 * @summary Transform a single order payment
 * @param {Object} payment A payment object
 * @returns {Object} Transformed payment
 */
export function xformOrderPayment(payment) {
  const {
    _id,
    address,
    amount,
    cardBrand,
    createdAt,
    currencyCode,
    data,
    displayName,
    mode,
    name: methodName,
    riskLevel,
    status
  } = payment;

  return {
    _id,
    amount: {
      amount,
      currencyCode
    },
    billingAddress: address,
    cardBrand,
    createdAt,
    currencyCode,
    data,
    displayName,
    isAuthorizationCanceled: (mode === "cancel"),
    isCaptured: (mode === "captured"),
    method: {
      name: methodName
    },
    riskLevel,
    status
  };
}

/**
 * @summary Transform a single fulfillment group fulfillment option
 * @param {Object} fulfillmentOption The group.shipmentMethod
 * @returns {Object} Transformed fulfillment option
 */
export function xformOrderFulfillmentGroupSelectedOption(fulfillmentOption) {
  return {
    fulfillmentMethod: {
      _id: fulfillmentOption._id,
      carrier: fulfillmentOption.carrier || null,
      displayName: fulfillmentOption.label || fulfillmentOption.name,
      group: fulfillmentOption.group || null,
      name: fulfillmentOption.name,
      // For now, this is always shipping. Revisit when adding download, pickup, etc. types
      fulfillmentTypes: ["shipping"]
    },
    handlingPrice: {
      amount: fulfillmentOption.handling || 0,
      currencyCode: fulfillmentOption.currencyCode
    },
    price: {
      amount: fulfillmentOption.rate || 0,
      currencyCode: fulfillmentOption.currencyCode
    }
  };
}

/**
 * @param {Object} context - an object containing the per-request state
 * @param {Object} item The order fulfillment group item in DB format
 * @param {Object[]} catalogItems Array of CatalogItem docs from the db
 * @param {Object[]} products Array of Product docs from the db
 * @return {Object} Same object with GraphQL-only props added
 */
async function xformOrderItem(context, item, catalogItems) {
  const { productId, variantId } = item;

  const catalogItem = catalogItems.find((cItem) => cItem.product.productId === productId);
  if (!catalogItem) {
    throw new ReactionError("not-found", `CatalogProduct with product ID ${productId} not found`);
  }

  const catalogProduct = catalogItem.product;

  const { variant } = await context.queries.findProductMedia(context, variantId, productId);
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
    ...item,
    imageURLs: media && media.URLs,
    productConfiguration: {
      productId: item.productId,
      productVariantId: item.variantId
    },
    subtotal: {
      amount: item.subtotal,
      currencyCode: item.price.currencyCode
    }
  };
}

/**
 * @param {Object} context - an object containing the per-request state
 * @param {Object[]} items Array of order fulfillment group items
 * @return {Object[]} Same array with GraphQL-only props added
 */
export async function xformOrderItems(context, items) {
  const { collections } = context;
  const { Catalog } = collections;

  const productIds = items.map((item) => item.productId);

  const catalogItems = await Catalog.find({
    "product.productId": {
      $in: productIds
    },
    "product.isVisible": true,
    "product.isDeleted": { $ne: true },
    "isDeleted": { $ne: true }
  }).toArray();

  return Promise.all(items.map((item) => xformOrderItem(context, item, catalogItems)));
}
