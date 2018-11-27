import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { Address as AddressSchema } from "/imports/collections/schemas";
import createSingleCharge from "../util/createSingleCharge";
import getStripeInstanceForShop from "../util/getStripeInstanceForShop";

const PACKAGE_NAME = "reaction-marketplace";

const paymentInputSchema = new SimpleSchema({
  billingAddress: AddressSchema,
  billingAddressId: {
    type: String,
    optional: true
  },
  stripeTokenId: String
});

const orderItemsSchema = new SimpleSchema({
  "addedAt": {
    type: Date,
    optional: true
  },
  "price": Number,
  "productConfiguration": Object,
  "productConfiguration.productId": String,
  "productConfiguration.productVariantId": String,
  "quantity": {
    type: SimpleSchema.Integer,
    min: 1
  }
});

const orderFulfillmentGroupSchema = new SimpleSchema({
  "data": {
    type: Object,
    blackbox: true,
    optional: true
  },
  "items": {
    type: Array,
    minCount: 1
  },
  "items.$": orderItemsSchema,
  "selectedFulfillmentMethodId": String,
  "shopId": String,
  "totalPrice": Number,
  "type": {
    type: String,
    allowedValues: ["shipping"]
  }
});

const orderInputSchema = new SimpleSchema({
  "cartId": {
    type: String,
    optional: true
  },
  "currencyCode": String,
  "email": String,
  "fulfillmentGroups": {
    type: Array,
    minCount: 1
  },
  "fulfillmentGroups.$": orderFulfillmentGroupSchema,
  "shopId": String
});

const inputSchema = new SimpleSchema({
  order: orderInputSchema,
  payment: paymentInputSchema
});

/**
 * @param {Object} context Context
 * @param {String} shopId Shop ID
 * @returns {String} The Stripe account ID for this shop. Throws if there isn't one
 */
async function getMerchantStripeId(context, shopId) {
  const { collections } = context;
  const { Packages } = collections;

  const merchantStripePkg = await Packages.findOne({
    name: PACKAGE_NAME,
    shopId
  });

  // If this merchant doesn't have stripe setup, fail.
  // We should _never_ get to this point, because
  // this will not roll back the entire transaction
  if (!merchantStripePkg ||
    !merchantStripePkg.settings ||
    !merchantStripePkg.settings.connectAuth ||
    !merchantStripePkg.settings.connectAuth.stripe_user_id) {
    throw new ReactionError("server-error", `Error processing payment for merchant shop with ID ${shopId}`);
  }

  return merchantStripePkg.settings.connectAuth.stripe_user_id;
}

/**
 * @method placeMarketplaceOrderWithStripeCardPayment
 * @summary Authorizes a credit card, given its Stripe-created token, and then
 *   creates an order with that payment attached.
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @return {Promise<Object>} Object with `order` property containing the created order
 */
export default async function placeMarketplaceOrderWithStripeCardPayment(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { order: orderInput, payment: paymentInput } = cleanedInput;
  const { currencyCode, email, shopId } = orderInput;
  const { billingAddress, billingAddressId, stripeTokenId } = paymentInput;
  const { accountId, mutations } = context;

  billingAddress._id = billingAddressId || Random.id();

  let applicationFee;
  let stripe;
  let stripeCustomerId;
  const stripeIdsByShopId = {};
  return mutations.createOrder(context, {
    order: orderInput,
    async afterValidate() {
      const result = await getStripeInstanceForShop(context, shopId);
      ({ applicationFee, stripe } = result);

      // For orders with only a single fulfillment group, we could create a charge directly from the card token, and skip
      // creating a customer. However, to keep the code simple and because we always have an email address and tracking
      // payments by customer in Stripe can be useful, we create a customer no matter what.
      const stripeCustomer = await stripe.customers.create({ email, metadata: { accountId }, source: stripeTokenId });
      stripeCustomerId = stripeCustomer.id;

      await Promise.all(orderInput.fulfillmentGroups.map(async (group) => {
        if (group.shopId === shopId) return null; // We use Stripe Connect only for merchants
        if (!stripeIdsByShopId[group.shopId]) {
          stripeIdsByShopId[group.shopId] = await getMerchantStripeId(context, shopId);
        }
      }));
    },
    async createPaymentForFulfillmentGroup(group) {
      return createSingleCharge(stripe, group, stripeCustomerId, currencyCode, billingAddress, stripeIdsByShopId[group.shopId], applicationFee);
    }
  });
}
