import _ from "lodash";
import SimpleSchema from "simpl-schema";
import doesDatabaseVersionMatch from "@reactioncommerce/db-version-check";
import { migrationsNamespace } from "../migrations/migrationsNamespace.js";
import { CouponTriggerCondition, CouponTriggerParameters } from "./simpleSchemas.js";

const expectedVersion = 2;

/**
 * @summary This is a preStartup function that is called before the app starts up.
 * @param {Object} context - The application context
 * @returns {undefined}
 */
export default async function preStartupPromotionCoupon(context) {
  const { simpleSchemas: { Cart, Promotion, RuleExpression }, promotions: pluginPromotions } = context;

  CouponTriggerCondition.extend({
    conditions: RuleExpression
  });

  CouponTriggerParameters.extend({
    conditions: RuleExpression
  });

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

  const setToExpectedIfMissing = async () => {
    const anyDiscount = await context.collections.Discounts.findOne();
    return !anyDiscount;
  };
  const ok = await doesDatabaseVersionMatch({
    // `db` is a Db instance from the `mongodb` NPM package,
    // such as what is returned when you do `client.db()`
    db: context.app.db,
    // These must match one of the namespaces and versions
    // your package exports in the `migrations` named export
    expectedVersion,
    namespace: migrationsNamespace,
    setToExpectedIfMissing
  });

  if (!ok) {
    throw new Error(`Database needs migrating. The "${migrationsNamespace}" namespace must be at version ${expectedVersion}. See docs for more information on migrations: https://github.com/reactioncommerce/api-migrations`);
  }
}
