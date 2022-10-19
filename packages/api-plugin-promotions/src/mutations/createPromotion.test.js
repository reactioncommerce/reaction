import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import _ from "lodash";
import SimpleSchema from "simpl-schema";
import { Promotion, Trigger } from "../simpleSchemas.js";
import createPromotion from "./createPromotion.js";

const triggerKeys = ["offers"];

Trigger.extend({
  triggerKey: {
    allowedValues: [...Trigger.getAllowedValuesForKey("triggerKey"), ...triggerKeys]
  }
});


mockContext.collections.Promotions = mockCollection("Promotions");
const insertResults = {
  insertedCount: 1,
  insertedId: "myId"
};
mockContext.collections.Promotions.insertOne = () => insertResults;

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
  stackAbility: "none"
};

mockContext.simpleSchemas = {
  Promotion
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


mockContext.promotions = {
  triggers: [
    offerTrigger
  ]
};

test("will not insert a record if it fails simple-schema validation", async () => {
  const promotion = {};
  try {
    await createPromotion(mockContext, promotion);
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});

test("will not insert a record with no triggers", async () => {
  const promotion = _.cloneDeep(OrderPromotion);
  promotion.triggers = [
    {
      triggerKey: "offers",
      triggerParameters: {
        name: "5 percent off your entire order when you spend more then $200"
      }
    }
  ];
  try {
    await createPromotion(mockContext, promotion);
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});

test("will not insert a record if trigger parameters are incorrect", async () => {
  const promotion = _.cloneDeep(OrderPromotion);
  promotion.triggers = [];
  try {
    await createPromotion(mockContext, promotion);
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});


test("will insert a record if it passes validation", async () => {
  const promotionToInsert = OrderPromotion;
  try {
    const { success } = await createPromotion(mockContext, promotionToInsert);
    expect(success).toBeTruthy();
  } catch (error) {
    expect(error).toBeUndefined();
  }
});
