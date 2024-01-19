import pkg from "../package.json" assert { type: "json" };
import schemas from "./schemas/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import triggers from "./triggers/index.js";
import { Coupon, CouponLog } from "./simpleSchemas.js";
import preStartupPromotionCoupon from "./preStartup.js";
import updateOrderCoupon from "./utils/updateOrderCoupon.js";


/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: pkg.label,
    name: pkg.name,
    version: pkg.version,
    collections: {
      Coupons: {
        name: "Coupons",
        indexes: [
          [{ shopId: 1, code: 1 }],
          [{ shopId: 1, promotionId: 1 }]
        ]
      },
      CouponLogs: {
        name: "CouponLogs",
        indexes: [
          [{ couponId: 1 }],
          [{ orderId: 1 }],
          [{ promotionId: 1 }],
          [{ couponId: 1, accountId: 1 }, { unique: true }]
        ]
      }
    },
    functionsByType: {
      preStartup: [preStartupPromotionCoupon]
    },
    promotions: {
      triggers
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    simpleSchemas: {
      Coupon,
      CouponLog
    },
    order: {
      customValidators: [
        {
          name: "updateOrderCoupon",
          fn: updateOrderCoupon
        }
      ]
    }
  });
}
