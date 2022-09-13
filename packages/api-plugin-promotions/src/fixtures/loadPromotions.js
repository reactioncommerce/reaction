const now = new Date();

const fifteenPercentOffAllKayaks = {
  _id: "15PercentOffAllKayaks",
  label: "15 Percent Off All Kayaks",
  description: "15 Percent off all Kayaks",
  discountType: "item",
  discountValue: 15,
  discountCalculationType: "percentage",
  inclusionRules: {
    conditions: {
      any: [
        {
          fact: "item",
          path: "productVendor",
          operator: "equal",
          value: "Products Inc."
        },
        {
          fact: "item",
          path: "class",
          operator: "contains",
          value: "Kayaks"
        }
      ]
    },
    event: { // define the event to fire when the conditions evaluate truthy
      type: "applyDiscount"
    }
  }
};

const fivePercentEntireOrder = {
  _id: "fivePercentOff",
  label: "5 percent off entire order",
  description: "5 percent off entire order",
  enabled: true,
  taxReported: true,
  discountType: "order",
  discountValue: 5,
  discountCalculationType: "percentage",
  inclusionRules: { // this applies to any cart so no conditions
    conditions: {},
    event: { // define the event to fire when the conditions evaluate truthy
      type: "applyDiscount"
    }
  }
};

const freeGroundShipping = {
  _id: "freeGroundShipping",
  label: "Free Ground Shipping",
  description: "Free Ground Shipping",
  enabled: false,
  taxReported: true,
  discountType: "shipping",
  discountValue: 0,
  discountCalculationType: "fixed",
  inclusionRules: {
    conditions: {
      any: [
        {
          fact: "method",
          path: "$.label",
          operator: "equal",
          value: "Ground Label"
        }
      ]
    },
    event: { // define the event to fire when the conditions evaluate truthy
      type: "applyDiscount"
    }
  }
};

const OfferPromotion = {
  _id: "offerPromotion",
  label: "Kayaks 15 percent off",
  description: "15% off all Kayaks",
  enabled: false,
  triggers: [{ triggerKey: "offers" }],
  offerRule: {
    name: "15% off all Kayaks",
    conditions: {
      any: [{
        fact: "cart",
        path: "$.merchandiseTotal",
        operator: "alwaysEqual",
        value: 100
      }]
    },
    event: { // define the event to fire when the conditions evaluate truthy
      type: "triggerAction",
      params: {
        promotionId: "offerPromotion"
      }
    }
  },
  actions: [{
    actionKey: "applyDiscountToCart",
    actionParameters: { discount: fifteenPercentOffAllKayaks }
  }],
  startDate: now,
  stackAbility: "all",
  reportAsTaxable: true
};

const OrderPromotion = {
  _id: "orderPromotion",
  label: "5 percent off your entire order when you spend more then $200",
  description: "5 percent off your entire order when you spend more then $200",
  enabled: false,
  triggers: [{ triggerKey: "offers" }],
  offerRule: {
    name: "5 percent off your entire order when you spend more then $200",
    conditions: {
      any: [{
        fact: "cart",
        path: "$.merchandiseTotal",
        operator: "greaterThanInclusive",
        value: 200
      }]
    },
    event: { // define the event to fire when the conditions evaluate truthy
      type: "triggerAction",
      params: {
        promotionId: "orderPromotion"
      }
    }
  },
  actions: [{
    actionKey: "applyDiscountToCart",
    actionParameters: { discount: fivePercentEntireOrder }
  }],
  startDate: now,
  stackAbility: "none",
  reportAsTaxable: true
};


const FreeGroundShipping = {
  _id: "freeGroundShippingPromotion",
  label: "Free Ground Shipping",
  description: "Free Ground Shipping on Orders over $$$",
  enabled: false,
  triggers: [{ triggerKey: "offers" }],
  offerRule: {
    name: "Free Ground Shipping",
    conditions: {
      any: [{
        fact: "cart",
        path: "$.merchandiseTotal",
        operator: "greaterThan",
        value: 99
      }]
    },
    event: { // define the event to fire when the conditions evaluate truthy
      type: "triggerAction",
      params: {
        promotionId: "offerPromotion"
      }
    }
  },
  actions: [{
    actionKey: "applyDiscountToCart",
    actionParameters: { discount: freeGroundShipping }
  }],
  startDate: now,
  stackAbility: "all",
  reportAsTaxable: true
};

const promotions = [FreeGroundShipping, OfferPromotion, OrderPromotion];

/**
 * @summary Load promotions fixtures
 * @param {Object} context - The application context
 * @returns {Promise<void>} undefined
 */
export default async function loadPromotions(context) {
  const { simpleSchemas: { Promotion: PromotionSchema }, collections: { Promotions, Shops } } = context;
  const defaultShop = await Shops.findOne({ shopType: "primary" }, { _id: 1 });
  if (defaultShop) {
    for (const promotion of promotions) {
      promotion.shopId = defaultShop._id;
      PromotionSchema.validate(promotion);
      // eslint-disable-next-line no-await-in-loop
      await Promotions.updateOne({ _id: promotion._id }, { $set: promotion }, { upsert: true });
    }
  }
}
