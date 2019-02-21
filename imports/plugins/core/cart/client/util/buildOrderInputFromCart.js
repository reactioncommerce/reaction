import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";

/**
 * @summary "catalog/getCurrentCatalogPriceForProductConfigurations" Meteor method wrapped in Promise
 * @param {Object[]} productConfigurations Array of product configurations
 * @param {String} currencyCode Currency in which to get prices
 * @returns {Promise<Object[]>} Same productConfigurations array, with price added
 */
function getCurrentCatalogPriceForProductConfigurations(productConfigurations, currencyCode) {
  return new Promise((resolve, reject) => {
    Meteor.call("catalog/getCurrentCatalogPriceForProductConfigurations", productConfigurations, currencyCode, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * @summary Takes a cart document and uses the information on it to construct a GraphQL
 *   OrderInput object, for placing an order at the end of the checkout process. This is
 *   done by individual payment UI components, but since building the OrderInput does not
 *   differ among these, that code can be shared here.
 * @param {Object} cart The cart document, in MongoDB schema
 * @returns {Object} GraphQL OrderInput object
 */
export default async function buildOrderInputFromCart(cart) {
  const [
    opaqueCartId,
    opaqueCartShopId
  ] = await getOpaqueIds([
    { namespace: "Cart", id: cart._id },
    { namespace: "Shop", id: cart.shopId }
  ]);

  const fulfillmentGroups = await Promise.all(cart.shipping.map(async (group) => {
    const items = cart.items.filter((cartItem) => group.itemIds.indexOf(cartItem._id) !== -1);
    const itemProductIds = items.map((item) => ({ namespace: "Product", id: item.productId }));
    const itemVariantIds = items.map((item) => ({ namespace: "Product", id: item.variantId }));

    const [
      opaqueGroupShopId,
      selectedFulfillmentMethodId,
      ...itemOpaqueProductIds
    ] = await getOpaqueIds([
      { namespace: "Shop", id: group.shopId },
      { namespace: "FulfillmentMethod", id: group.shipmentMethod._id },
      ...itemProductIds
    ]);

    const itemOpaqueVariantIds = await getOpaqueIds(itemVariantIds);

    // Need to get current price of all items from the server
    const productConfigurations = items.map((item) => ({
      productId: item.productId,
      productVariantId: item.variantId
    }));

    const productConfigurationsWithPrice = await getCurrentCatalogPriceForProductConfigurations(productConfigurations, cart.currencyCode);

    let itemTotal = 0;
    let taxTotal = 0;
    const finalItems = items.map((item, index) => {
      const productConfig = productConfigurationsWithPrice.find((config) => config.productId === item.productId && config.productVariantId === item.variantId);
      if (!productConfig || !productConfig.price) throw new Error(`Unable to find current price of variant ${item.variantId}`);
      const { price } = productConfig;
      itemTotal += price * item.quantity;
      taxTotal += (item.tax || 0);
      return {
        addedAt: item.addedAt,
        price,
        productConfiguration: {
          productId: itemOpaqueProductIds[index],
          productVariantId: itemOpaqueVariantIds[index]
        },
        quantity: item.quantity
      };
    });

    // Fulfillment
    const shippingTotal = group.shipmentMethod.rate || 0;
    const handlingTotal = group.shipmentMethod.handling || 0;
    const fulfillmentTotal = shippingTotal + handlingTotal;
    const surchargesTotal = cart.surcharges.reduce((sum, surcharge) => sum + surcharge.amount, 0);


    // To avoid rounding errors, be sure to keep this calculation the same between here and
    // `createOrder.js` in the server code.
    const totalPrice = Math.max(0, itemTotal + fulfillmentTotal + taxTotal + surchargesTotal);

    const shippingAddress = {
      address1: group.address.address1,
      address2: group.address.address2,
      city: group.address.city,
      country: group.address.country,
      fullName: group.address.fullName,
      isCommercial: group.address.isCommercial,
      phone: group.address.phone,
      postal: group.address.postal,
      region: group.address.region
    };

    return {
      data: {
        shippingAddress
      },
      items: finalItems,
      selectedFulfillmentMethodId,
      shopId: opaqueGroupShopId,
      totalPrice,
      type: group.type
    };
  }));

  // OrderInput must have an email. If one wasn't entered, take it from the logged in account
  let { email } = cart;
  if (!email) {
    const customerAccount = Accounts.findOne({ _id: cart.accountId });
    if (customerAccount) {
      const defaultEmail = (customerAccount.emails || []).find((emailRecord) => emailRecord.provides === "default");
      if (defaultEmail) {
        email = defaultEmail.address;
      }
    }
  }

  return {
    cartId: opaqueCartId,
    currencyCode: cart.currencyCode,
    email,
    fulfillmentGroups,
    shopId: opaqueCartShopId
  };
}
