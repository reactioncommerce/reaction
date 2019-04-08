import Logger from "@reactioncommerce/logger";
import collectionIndex from "/imports/utils/collectionIndex";
import updateCartItemsForVariantPriceChange from "./util/updateCartItemsForVariantPriceChange";

const AFTER_CATALOG_UPDATE_EMITTED_BY_NAME = "CART_CORE_PLUGIN_AFTER_CATALOG_UPDATE";

/**
 * @param {Object[]} catalogProductVariants The `product.variants` array from a catalog item
 * @returns {Object[]} All variants and their options flattened in one array
 */
function getFlatVariantsAndOptions(catalogProductVariants) {
  const variants = [];

  catalogProductVariants.forEach((variant) => {
    variants.push(variant);
    if (variant.options) {
      variant.options.forEach((option) => {
        variants.push(option);
      });
    }
  });

  return variants;
}

/**
 * @param {Object} Cart Cart collection
 * @param {Object} context App context
 * @param {String} variant The catalog product variant or option
 * @returns {Promise<null>} Promise that resolves with null
 */
async function updateAllCartsForVariant({ Cart, context, variant }) {
  const { appEvents, queries } = context;
  const { variantId } = variant;

  // Do find + update because we need the `cart.currencyCode` to figure out pricing
  // and we need current quantity to recalculate `subtotal` for each item.
  // It should be fine to load all results into an array because even for large shops,
  // there will likely not be a huge number of the same product in carts at the same time.
  const carts = await Cart.find({
    "items.variantId": variantId
  }, {
    projection: { _id: 1, currencyCode: 1, items: 1 }
  }).toArray();

  await Promise.all(carts.map(async (cart) => {
    const prices = await queries.getVariantPrice(context, variant, cart.currencyCode);
    if (!prices) return;

    const { didUpdate, updatedItems } = updateCartItemsForVariantPriceChange(cart.items, variantId, prices);
    if (!didUpdate) return;

    // Update the cart
    const { result } = await Cart.updateOne({
      _id: cart._id
    }, {
      $set: {
        items: updatedItems,
        updatedAt: new Date()
      }
    });
    if (result.ok !== 1) {
      Logger.warn(`MongoDB error trying to update cart ${cart._id} in "afterPublishProductToCatalog" listener. Check MongoDB logs.`);
      return;
    }

    // Emit "after update"
    const updatedCart = await Cart.findOne({ _id: cart._id });
    appEvents.emit("afterCartUpdate", {
      cart: updatedCart,
      updatedBy: null
    }, { emittedBy: AFTER_CATALOG_UPDATE_EMITTED_BY_NAME });
  }));

  return null;
}

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections } = context;
  const { Cart } = collections;

  // Create indexes. We set specific names for backwards compatibility
  // with indexes created by the aldeed:schema-index Meteor package.
  collectionIndex(Cart, { accountId: 1 }, { name: "c2_accountId" });
  collectionIndex(Cart, { anonymousAccessToken: 1 }, { name: "c2_anonymousAccessToken" });
  collectionIndex(Cart, { email: 1 }, { name: "c2_email" });
  collectionIndex(Cart, {
    referenceId: 1
  }, {
    unique: true,
    // referenceId is an optional field for carts, so we want the uniqueness constraint
    // to apply only to non-null fields or the second document with value `null`
    // would throw an error.
    partialFilterExpression: {
      referenceId: {
        $type: "string"
      }
    }
  });
  collectionIndex(Cart, { sessionId: 1 }, { name: "c2_sessionId" });
  collectionIndex(Cart, { shopId: 1 }, { name: "c2_shopId" });
  collectionIndex(Cart, { "billing.paymentMethod.items.productId": 1 }, { name: "c2_billing.$.paymentMethod.items.$.productId" });
  collectionIndex(Cart, { "billing.paymentMethod.items.shopId": 1 }, { name: "c2_billing.$.paymentMethod.items.$.shopId" });
  collectionIndex(Cart, { "billing.paymentMethod.workflow.status": 1 }, { name: "c2_billing.$.paymentMethod.workflow.status" });
  collectionIndex(Cart, { "items.productId": 1 }, { name: "c2_items.$.productId" });
  collectionIndex(Cart, { "items.product.ancestors": 1 }, { name: "c2_items.$.product.ancestors" });
  collectionIndex(Cart, { "items.product.createdAt": 1 }, { name: "c2_items.$.product.createdAt" });
  collectionIndex(Cart, { "items.product.handle": 1 }, { name: "c2_items.$.product.handle" });
  collectionIndex(Cart, { "items.product.hashtags": 1 }, { name: "c2_items.$.product.hashtags" });
  collectionIndex(Cart, { "items.product.isDeleted": 1 }, { name: "c2_items.$.product.isDeleted" });
  collectionIndex(Cart, { "items.product.isVisible": 1 }, { name: "c2_items.$.product.isVisible" });
  collectionIndex(Cart, { "items.product.shopId": 1 }, { name: "c2_items.$.product.shopId" });
  collectionIndex(Cart, { "items.product.workflow.status": 1 }, { name: "c2_items.$.product.workflow.status" });
  collectionIndex(Cart, { "items.shopId": 1 }, { name: "c2_items.$.shopId" });
  collectionIndex(Cart, { "items.variantId": 1 }, { name: "c2_items.$.variantId" });
  collectionIndex(Cart, { "items.variants.isDeleted": 1 }, { name: "c2_items.$.variants.isDeleted" });
  collectionIndex(Cart, { "items.variants.isVisible": 1 }, { name: "c2_items.$.variants.isVisible" });
  collectionIndex(Cart, { "items.variants.shopId": 1 }, { name: "c2_items.$.variants.shopId" });
  collectionIndex(Cart, { "items.variants.workflow.status": 1 }, { name: "c2_items.$.variants.workflow.status" });
  collectionIndex(Cart, { "shipping.items.productId": 1 }, { name: "c2_shipping.$.items.$.productId" });
  collectionIndex(Cart, { "shipping.items.shopId": 1 }, { name: "c2_shipping.$.items.$.shopId" });
  collectionIndex(Cart, { "shipping.workflow.status": 1 }, { name: "c2_shipping.$.workflow.status" });
  collectionIndex(Cart, { "workflow.status": 1 }, { name: "c2_workflow.status" });

  // When an order is created, delete the source cart
  appEvents.on("afterOrderCreate", async ({ order }) => {
    const { cartId } = order;
    if (cartId) {
      const { result } = await Cart.deleteOne({ _id: cartId });
      if (result.ok !== 1) {
        Logger.warn(`MongoDB error trying to delete cart ${cartId} in "afterOrderCreate" listener. Check MongoDB logs.`);
      }
    }
  });

  // When a variant's price changes, change the `price` and `subtotal` fields of all CartItems for that variant.
  // When a variant's compare-at price changes, change the `compareAtPrice` field of all CartItems for that variant.
  appEvents.on("afterPublishProductToCatalog", async ({ catalogProduct }) => {
    const { variants } = catalogProduct;

    const variantsAndOptions = getFlatVariantsAndOptions(variants);

    // Update all cart items that are linked with the updated variants
    await Promise.all(variantsAndOptions.map(async (variant) =>
      updateAllCartsForVariant({ Cart, context, variant })));
  });
}
