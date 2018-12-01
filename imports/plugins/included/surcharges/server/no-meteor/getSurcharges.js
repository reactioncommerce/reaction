// import Logger from "@reactioncommerce/logger";
// import ReactionError from "@reactioncommerce/reaction-error";
import { xformCartCheckout } from "@reactioncommerce/reaction-graphql-xforms/cart";

/**
 * @summary Returns a list of surcharges based on the cart.
 * @param {Object} context - Context
 * @param {Object} cartWithSummary - the user's cart with its summary
 * @param {Object} cart - the user's cart
 * @return {Array} - an array that surcharges to apply to cart / order
 * @private
 */
export default async function getSurcharges(context, cart) {
  const { collections } = context;
  const surcharges = [];

  // const cartWithSummary = await xformCartCheckout(collections, cart);

  // // Need fulfillment group to pass to hydrated carte

  // const hydratedCart = await getShippingRestrictionAttributes(context, cartWithSummary, fulfillmentGroup);

  // // map over cart, check for itemst hat match



  // console.log(" -------------------- cart -------------------- ", cart);

  surcharges.push(
    {
      _id: "DFZ3td3hgwaBAHiNm",
      amount:  {
        amount: 5.99,
        displayAmount: "5.99",
        currencyCode: "USD"
      },
      message: {
        message: "This is a test surcharge, #1."
      },
      surchargeId: "DFZ3td3hgwaBAHiNm",
      fulfillmentGroupId: "DFZ3td3hgwaBAHiNm",
      cartId: "DFZ3td3hgwaBAHiNm"
    },
    {
      _id: "ANKd9JgmAdsRzjiJh",
      amount:  {
        amount: 6.99,
        displayAmount: "6.99",
        currencyCode: "USD"
      },
      message: {
        message: "This is a test surcharge, #2."
      },
      surchargeId: "ANKd9JgmAdsRzjiJh",
      fulfillmentGroupId: "ANKd9JgmAdsRzjiJh",
      cartId: "ANKd9JgmAdsRzjiJh"
    },
    {
      _id: "fbvawYJHFSk8rHif",
      amount:  {
        amount: 1.99,
        displayAmount: "1.99",
        currencyCode: "USD"
      },
      message: {
        message: "This is a test surcharge, #3."
      },
      surchargeId: "fbvawYJHFSk8rHif",
      fulfillmentGroupId: "fbvawYJHFSk8rHif",
      cartId: "fbvawYJHFSk8rHif"
    }
  );

  return surcharges;
}
