import { Migrations } from "meteor/percolate:migrations";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import { Accounts, Cart } from "/lib/collections";

// Do this migration in batches of 200 to avoid memory issues
const LIMIT = 200;

/**
 * @private
 * @param {String} currencyCode The currency code
 * @returns {Function} A map function for converting cart items
 */
function getConvertCartItemUp(currencyCode) {
  return (item) => {
    const chosenProduct = item.product;
    const chosenVariant = item.variants;
    const variantPriceInfo = (chosenVariant.pricing && chosenVariant.pricing[currencyCode]) || {};

    const newItem = {
      ...item,
      addedAt: item.addedAt || item.createdAt || new Date(),
      createdAt: item.createdAt || new Date(),
      isTaxable: (chosenVariant && chosenVariant.taxable) || false,
      optionTitle: chosenVariant && chosenVariant.optionTitle,
      priceWhenAdded: {
        amount: variantPriceInfo.price || chosenVariant.price,
        currencyCode
      },
      productId: item.productId || (chosenProduct && chosenProduct._id),
      productSlug: chosenProduct && (chosenProduct.slug || chosenProduct.handle),
      productVendor: chosenProduct && chosenProduct.vendor,
      productType: item.type || (chosenProduct && chosenProduct.type),
      shopId: item.shopId || (chosenProduct && chosenProduct.shopId),
      taxCode: chosenVariant && chosenVariant.taxCode,
      title: item.title || (chosenProduct && chosenProduct.title) || "Unknown Item",
      updatedAt: item.updatedAt || item.createdAt || new Date(),
      variantId: chosenVariant && chosenVariant._id,
      variantTitle: chosenVariant && chosenVariant.title
    };

    delete newItem.product;
    delete newItem.variants;

    return newItem;
  };
}

/**
 * @private
 * @summary Does a Cart.update to convert the provided cart
 * @param {Object} cart The cart document
 * @returns {undefined}
 */
function convertCartUp(cart) {
  const currencyCode = (cart.billing && cart.billing[0] && cart.billing[0].currency && cart.billing[0].currency.userCurrency) || "USD";
  const convertCartItemUp = getConvertCartItemUp(currencyCode);

  const account = cart.userId ? Accounts.findOne({ userId: cart.userId }) : null;
  const accountId = (account && account._id) || null;
  const anonymousAccessToken = cart.sessionId ? hashToken(cart.sessionId) : null;

  Cart.update({ _id: cart._id }, {
    $set: {
      accountId,
      anonymousAccessToken,
      currencyCode,
      items: (cart.items || []).map(convertCartItemUp)
    },
    $unset: {
      userId: ""
    }
  }, { bypassCollection2: true });
}

/**
 * @private
 * @param {Object} item The cart item
 * @returns {Object} Converted cart item
 */
function convertCartItemDown(item) {
  const newItem = {
    ...item,
    type: item.productType
  };

  delete newItem.addedAt;
  delete newItem.createdAt;
  delete newItem.isTaxable;
  delete newItem.updatedAt;
  delete newItem.priceWhenAdded;
  delete newItem.productSlug;
  delete newItem.productType;
  delete newItem.productVendor;
  delete newItem.optionTitle;
  delete newItem.taxCode;
  delete newItem.variantId;
  delete newItem.variantTitle;

  return newItem;
}

/**
 * @private
 * @summary Does a Cart.update to convert the provided cart
 * @param {Object} cart The cart document
 * @returns {undefined}
 */
function convertCartDown(cart) {
  const account = cart.accountId ? Accounts.findOne({ _id: cart.accountId }) : null;
  const userId = (account && account.userId) || null;

  Cart.update({ _id: cart._id }, {
    $set: {
      items: (cart.items || []).map(convertCartItemDown),
      userId
    },
    $unset: {
      accountId: "",
      anonymousAccessToken: "",
      currencyCode: ""
    }
  }, { bypassCollection2: true });
}

Migrations.add({
  version: 30,
  up() {
    try {
      Promise.await(Cart.rawCollection().dropIndex("c2_userId"));
    } catch (error) {
      // This may fail if the index doesn't exist, which is what we want anyway
    }

    let carts;

    do {
      carts = Cart.find({
        // Find everything we haven't converted yet.
        currencyCode: { $exists: false }
      }, {
        limit: LIMIT,
        sort: {
          createdAt: 1
        }
      }).fetch();

      if (carts.length) {
        carts.forEach(convertCartUp);
      }
    } while (carts.length);
  },
  down() {
    let carts;

    do {
      carts = Cart.find({
        // Find everything we haven't converted yet.
        currencyCode: { $exists: true }
      }, {
        limit: LIMIT,
        sort: {
          createdAt: 1
        }
      }).fetch();

      if (carts.length) {
        carts.forEach(convertCartDown);
      }
    } while (carts.length);
  }
});
