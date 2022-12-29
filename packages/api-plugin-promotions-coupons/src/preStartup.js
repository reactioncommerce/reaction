import _ from "lodash";
import SimpleSchema from "simpl-schema";

/**
 * @summary This is a preStartup function that is called before the app starts up.
 * @param {Object} context - The application context
 * @returns {undefined}
 */
export default async function preStartupPromotionCoupon(context) {
  const { simpleSchemas: { Cart, Promotion } } = context;
  const copyPromotion = _.cloneDeep(Promotion);

  const relatedCoupon = new SimpleSchema({
    couponCode: String,
    couponId: String
  });

  copyPromotion.extend({
    relatedCoupon: {
      type: relatedCoupon,
      optional: true
    }
  });

  Cart.extend({
    "appliedPromotions.$": copyPromotion
  });
}
