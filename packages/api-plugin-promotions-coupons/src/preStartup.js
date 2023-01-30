import _ from "lodash";
import SimpleSchema from "simpl-schema";

/**
 * @summary This is a preStartup function that is called before the app starts up.
 * @param {Object} context - The application context
 * @returns {undefined}
 */
export default async function preStartupPromotionCoupon(context) {
  const { simpleSchemas: { Cart, Promotion }, promotions: pluginPromotions } = context;

  // because we're reusing the offer trigger, we need to promotion-discounts plugin to be installed first
  const offerTrigger = pluginPromotions.triggers.find((trigger) => trigger.key === "offers");
  if (!offerTrigger) throw new Error("No offer trigger found. Need to register offers trigger first.");

  const copiedPromotion = _.cloneDeep(Promotion);

  const relatedCoupon = new SimpleSchema({
    couponCode: String,
    couponId: String
  });

  copiedPromotion.extend({
    relatedCoupon: {
      type: relatedCoupon,
      optional: true
    }
  });

  Cart.extend({
    "appliedPromotions.$": copiedPromotion
  });
}
