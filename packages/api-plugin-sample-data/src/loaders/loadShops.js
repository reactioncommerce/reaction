import Logger from "@reactioncommerce/logger";
import ShopsData from "../json-data/Shops.json" assert { type: "json" };


/**
 * @summary getInternalContext clone with account & user info
 * @param {object} context - The application context
 * @param {object} account - The account details
 * @param {object} user - The user details
 * @returns {object} Custom context object
 */
function getCustomContext(context, account, user) {
  return {
    ...context,
    account,
    accountId: account._id,
    user,
    userId: user._id,
    isInternalCall: true,
    userHasPermission: async () => true,
    validatePermissions: async () => undefined
  };
}

/**
 * @summary load a single Shop
 * @param {object} context - The application context
 * @param {object} account - The account object
 * @param {object} user - The user object
 * @returns {Promise<Boolean>} true if success
 */
export default async function loadShops(context, account, user) {
  const { collections: { Shops } } = context;
  const [oneShop] = ShopsData;
  const customContext = getCustomContext(context, account, user);
  const shop = await context.mutations.createShop(customContext, oneShop);

  const shopUpdateObj = {
    shopId: shop._id,
    allowGuestCheckout: true,
    emails: [{
      address: "no-reply@example.com"
    }]
  };
  try {
    await context.mutations.updateShop(customContext, shopUpdateObj);
  } catch (error) {
    Logger.warn("Error updating shop with Checkout & Email: ", shop._id);
  }

  // Dataloaders are not present in the context at this stage
  // So the below mutation will fail internally while trying to find shopById
  // Hence we need to manually update the shop
  // const paymentMethodObj = {
  //   shopId: shop._id,
  //   isEnabled: true,
  //   paymentMethodName: "iou_example"
  // }
  // let paymentUpdate = await context.mutations.enablePaymentMethodForShop(customContext, paymentMethodObj);

  try {
    await Shops.updateOne({ _id: shop._id }, { $set: { availablePaymentMethods: ["iou_example"] } });
  } catch (error) {
    Logger.warn("Error updating shop with PaymentMethods: ", shop._id);
  }

  return shop._id;
}
