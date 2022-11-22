import SimpleSchema from "simpl-schema";
import validateTriggerParams from "./validateTriggerParams.js";


const now = new Date();


const OrderPromotion = {
  _id: "orderPromotion",
  shopId: "testShop",
  type: "implicit",
  label: "5 percent off your entire order when you spend more then $200",
  description: "5 percent off your entire order when you spend more then $200",
  enabled: true,
  triggers: [
    {
      triggerKey: "offers",
      triggerParameters: {
        name: "5 percent off your entire order when you spend more then $200",
        conditions: {
          any: [
            {
              fact: "cart",
              path: "$.merchandiseTotal",
              operator: "greaterThanInclusive",
              value: 200
            }
          ]
        }
      }
    }
  ],
  actions: [
    {
      actionKey: "noop",
      actionParameters: {}
    }
  ],
  startDate: now,
  endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
  stackability: "none"
};

export const OfferTriggerParameters = new SimpleSchema({
  name: String,
  conditions: {
    type: Object,
    blackbox: true
  }
});

const offerTrigger = {
  key: "offers",
  handler: () => {},
  paramSchema: OfferTriggerParameters
};

const context = {
  promotions: {
    triggers: [
      offerTrigger
    ]
  }
};

test("validates trigger parameters against the appropriate paramSchema", () => {
  try {
    validateTriggerParams(context, OrderPromotion);
  } catch (error) {
    expect(error).toBeUndefined();
  }
});
