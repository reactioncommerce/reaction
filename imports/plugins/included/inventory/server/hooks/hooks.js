import { Meteor } from "meteor/meteor";
import { Cart, Orders, Products } from "/lib/collections";
import { Logger, Hooks } from "/server/api";
import { registerInventory } from "../methods/inventory";

/**
* @method afterAddItemsToCart
* @summary reserves inventory when item is added to cart
* @param {String} cartId - current cartId
* @param {Object} options - product document
* @return {undefined}
*/
Hooks.Events.add("afterAddItemsToCart", (cartId, options) => {
  // Adding a new product or variant to the cart
  Logger.debug("after cart update, call inventory/addReserve");
  // Look up cart to get items added to it
  const { items } = Cart.findOne({ _id: cartId }) || {};
  // Reserve item
  Meteor.call("inventory/addReserve", items.filter((item) => item._id === options.newItemId));
});

/**
* @method afterModifyQuantityInCart
* @summary reserves inventory when cart quantity is updated
* @param {String} cartId - current cartId
* @param {Object} options - product document
* @return {undefined}
*/
Hooks.Events.add("afterModifyQuantityInCart", (cartId, options) => {
  // Modifying item quantity in cart.
  Logger.debug("after variant increment, call inventory/addReserve");

  // Look up cart to get items that have been added to it
  const { items } = Cart.findOne({ _id: cartId }) || {};

  // Item to increment quantity
  const item = items.filter((i) => (i.product._id === options.productId && i.variants._id === options.variantId));
  Meteor.call("inventory/addReserve", item);
});


/**
* @method afterRemoveCatalogProduct
* @summary updates product inventory after variant is removed
* @param {String} userId - userId of user making the call
* @param {Object} doc - product document
* @return {undefined}
*/
Hooks.Events.add("afterRemoveCatalogProduct", (userId, doc) => {
  if (doc.type === "variant") {
    const variantItem = {
      productId: doc.ancestors[0],
      variantId: doc._id,
      shopId: doc.shopId
    };
    Logger.debug(`remove inventory variants for variant: ${doc._id
    }, call inventory/remove`);
    Meteor.call("inventory/remove", variantItem);
  }

  return doc;
});

/**
* @method afterUpdateCatalogProduct
* @summary adjust inventory of variants after an update
* @param {String} userId - userId of user making the call
* @param {Object} doc - product document
* @return {undefined}
*/
Hooks.Events.add("afterUpdateCatalogProduct", (doc) => {
  // Find the most recent version of the product document based on
  // the passed in doc._id
  const productDocument = Products.findOne({
    _id: doc._id
  });

  if (doc.type === "variant") {
    Meteor.call("inventory/adjust", productDocument);
  }

  return productDocument;
});

/**
* @method afterInsertCatalogProduct
* @summary adds product inventory when new product is created
* @param {String} userId - userId of user making the call
* @param {Object} doc - product document
* @return {undefined}
*/
Hooks.Events.add("afterInsertCatalogProduct", (doc) => {
  if (doc.type !== "variant") {
    return false;
  }
  registerInventory(doc);

  return doc;
});

/**
 * markInventoryShipped
 * @summary check a product and update Inventory collection with inventory documents.
 * @param {Object} product - valid Schemas.Product object
 * @return {Number} - returns the total amount of new inventory created
 */
function markInventoryShipped(doc) {
  const order = Orders.findOne(doc._id);
  const orderItems = order.items;
  const cartItems = [];
  for (const orderItem of orderItems) {
    const cartItem = {
      _id: orderItem.cartItemId || orderItem._id,
      shopId: orderItem.shopId,
      quantity: orderItem.quantity,
      productId: orderItem.productId,
      product: orderItem.product,
      variants: orderItem.variants,
      title: orderItem.title
    };
    cartItems.push(cartItem);
  }
  Meteor.call("inventory/shipped", cartItems);

  return doc;
}

/**
 * markInventorySold
 * @summary check a product and update Inventory collection with inventory documents.
 * @param {Object} doc - valid Schemas.Product object
 * @return {Number} - returns the total amount of new inventory created
 */
function markInventorySold(doc) {
  const orderItems = doc.items;
  const cartItems = [];
  // If a cartItemId exists it's a legacy order and we use that
  for (const orderItem of orderItems) {
    const cartItem = {
      _id: orderItem.cartItemId || orderItem._id,
      shopId: orderItem.shopId,
      quantity: orderItem.quantity,
      productId: orderItem.productId,
      product: orderItem.product,
      variants: orderItem.variants,
      title: orderItem.title
    };
    cartItems.push(cartItem);
  }
  Meteor.call("inventory/sold", cartItems);

  return doc;
}

/**
* @method afterOrderInsert
* @summary marks inventory as sold when order is created
* @param {Object} order - order document
* @return {Object} order - order document
*/
Hooks.Events.add("afterOrderInsert", (order) => {
  Logger.debug("Inventory module handling Order insert");
  markInventorySold(order);

  return order;
});

/**
* @method onOrderShipmentShipped
* @summary marks inventory as shipped when order workflow is completed
* @param {Object} doc - order document
* @return {undefined}
*/
Hooks.Events.add("onOrderShipmentShipped", (doc) => {
  Logger.debug("Inventory module handling Order update");
  markInventoryShipped(doc);

  return doc;
});
