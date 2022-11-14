import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import _ from "lodash";
import SimpleSchema from "simpl-schema";
import { Promotion as PromotionSchema, Promotion, Trigger } from "../simpleSchemas.js";
import updatePromotion from "./updatePromotion.js";

const now = new Date();

const triggerKeys = ["offers"];
const promotionTypes = ["coupon"];

Trigger.extend({
  triggerKey: {
    allowedValues: [...Trigger.getAllowedValuesForKey("triggerKey"), ...triggerKeys]
  }
});


PromotionSchema.extend({
  promotionType: {
    allowedValues: [...PromotionSchema.getAllowedValuesForKey("promotionType"), ...promotionTypes]
  }
});


mockContext.collections.Promotions = mockCollection("Promotions");
const insertResults = {
  insertedCount: 1,
  insertedId: "myId"
};
mockContext.collections.Promotions.insertOne = () => insertResults;


const OrderPromotion = {
  _id: "orderPromotion",
  referenceId: 123,
  shopId: "testShop",
  promotionType: "coupon",
  triggerType: "explicit",
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
  stackAbility: "none",
  createdAt: now,
  updatedAt: now
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
  paramSchema: OfferTriggerParameters,
  type: "explicit"
};


mockContext.promotions = {
  triggers: [
    offerTrigger
  ]
};

test("will not update a record if it fails simple-schema validation", async () => {
  const promotion = {};
  try {
    await updatePromotion(mockContext, { shopId: promotion.shopId, promotion });
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
    await updatePromotion(mockContext, { shopId: promotion.shopId, promotion });
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});

test("will not update a record if trigger parameters are incorrect", async () => {
  const promotion = _.cloneDeep(OrderPromotion);
  promotion.triggers = [];
  try {
    await updatePromotion(mockContext, { shopId: promotion.shopId, promotion });
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});


test("will insert a record if it passes validation", async () => {
  const promotionToUpdate = OrderPromotion;
  try {
    const { success } = await updatePromotion(mockContext, { shopId: promotionToUpdate.shopId, promotion: promotionToUpdate });
    expect(success).toBeTruthy();
  } catch (error) {
    expect(error).toBeUndefined();
  }
});
