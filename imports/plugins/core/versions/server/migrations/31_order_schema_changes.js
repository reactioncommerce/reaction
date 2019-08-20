import { Migrations } from "meteor/percolate:migrations";
import { Accounts, Orders } from "/lib/collections";

// Do this migration in batches of 200 to avoid memory issues
const LIMIT = 200;

/**
 * @private
 * @param {String} currencyCode The currency code
 * @returns {Function} A map function for converting order items
 */
function getConvertOrderItemUp(currencyCode) {
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
      productType: item.type || (chosenProduct && chosenProduct.type),
      productVendor: chosenProduct && chosenProduct.vendor,
      shopId: item.shopId || (chosenProduct && chosenProduct.shopId),
      taxCode: chosenVariant && chosenVariant.taxCode,
      title: item.title || (chosenProduct && chosenProduct.title) || "Unknown Item",
      updatedAt: item.updatedAt || item.createdAt || new Date(),
      variantId: chosenVariant && chosenVariant._id,
      variantTitle: chosenVariant && chosenVariant.title
    };

    return newItem;
  };
}

/**
 * @private
 * @summary Does a Orders.update to convert the provided order
 * @param {Object} order The order document
 * @returns {undefined}
 */
function convertOrderUp(order) {
  const currencyCode = (order.billing && order.billing[0] && order.billing[0].currency && order.billing[0].currency.userCurrency) || "USD";
  const convertOrderItemUp = getConvertOrderItemUp(currencyCode);

  const account = order.userId ? Accounts.findOne({ userId: order.userId }) : null;
  const accountId = (account && account._id) || null;

  Orders.update({ _id: order._id }, {
    $set: {
      accountId,
      currencyCode,
      items: (order.items || []).map(convertOrderItemUp)
    },
    $unset: {
      userId: ""
    }
  }, { bypassCollection2: true });
}

/**
 * @private
 * @param {Object} item The order item
 * @returns {Object} Converted order item
 */
function convertOrderItemDown(item) {
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
 * @summary Does a Orders.update to convert the provided order
 * @param {Object} order The order document
 * @returns {undefined}
 */
function convertOrderDown(order) {
  const account = order.accountId ? Accounts.findOne({ _id: order.accountId }) : null;
  const userId = (account && account.userId) || null;

  Orders.update({ _id: order._id }, {
    $set: {
      items: (order.items || []).map(convertOrderItemDown),
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
  version: 31,
  up() {
    try {
      Promise.await(Orders.rawCollection().dropIndex("c2_userId"));
    } catch (error) {
      // This may fail if the index doesn't exist, which is what we want anyway
    }

    let orders;

    do {
      orders = Orders.find({
        // Find everything we haven't converted yet.
        currencyCode: { $exists: false }
      }, {
        limit: LIMIT,
        sort: {
          createdAt: 1
        }
      }).fetch();

      if (orders.length) {
        orders.forEach(convertOrderUp);
      }
    } while (orders.length);
  },
  down() {
    let orders;

    do {
      orders = Orders.find({
        // Find everything we haven't converted yet.
        currencyCode: { $exists: true }
      }, {
        limit: LIMIT,
        sort: {
          createdAt: 1
        }
      }).fetch();

      if (orders.length) {
        orders.forEach(convertOrderDown);
      }
    } while (orders.length);
  }
});
