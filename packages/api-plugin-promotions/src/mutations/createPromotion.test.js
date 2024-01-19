import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import _ from "lodash";
import SimpleSchema from "simpl-schema";
import { Promotion as PromotionSchema, Promotion, Trigger, Stackability } from "../simpleSchemas.js";
import createPromotion from "./createPromotion.js";
import { CreateOrderPromotion } from "./fixtures/orderPromotion.js";

const triggerKeys = ["offers"];
const promotionTypes = ["coupon"];
const stackAbilities = ["all", "none"];

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

Stackability.extend({
  key: {
    allowedValues: [...Stackability.getAllowedValuesForKey("key"), ...stackAbilities]
  }
});

mockContext.collections.Promotions = mockCollection("Promotions");
const insertResults = {
  insertedCount: 1,
  insertedId: "myId"
};
mockContext.collections.Promotions.insertOne = () => insertResults;
mockContext.mutations.incrementSequence = () => 1000000;
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
  type: "implicit"
};

const discountActionParameters = new SimpleSchema({
  discountType: {
    type: String,
    allowedValues: ["item", "order", "shipping"]
  },
  discountCalculationType: {
    type: String,
    allowedValues: ["flat", "fixed", "percentage"]
  },
  discountValue: {
    type: Number
  },
  discountMaxValue: {
    type: Number,
    optional: true
  },
  discountMaxUnits: {
    type: Number,
    optional: true
  },
  inclusionRules: {
    type: Object,
    blackbox: true,
    optional: true
  },
  exclusionRules: {
    type: Object,
    blackbox: true,
    optional: true
  },
  neverStackWithOtherItemLevelDiscounts: {
    type: Boolean,
    optional: true,
    defaultValue: false
  }
});

const discountAction = {
  key: "discounts",
  handler: () => {},
  paramSchema: discountActionParameters
};


mockContext.promotions = {
  triggers: [
    offerTrigger
  ],
  actions: [
    discountAction
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
  const promotion = _.cloneDeep(CreateOrderPromotion);
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
  const promotion = _.cloneDeep(CreateOrderPromotion);
  promotion.triggers = [];
  try {
    await createPromotion(mockContext, promotion);
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});


test("will insert a record if it passes validation", async () => {
  const promotionToInsert = CreateOrderPromotion;
  try {
    const { success } = await createPromotion(mockContext, promotionToInsert);
    expect(success).toBeTruthy();
  } catch (error) {
    expect(error).toBeUndefined();
  }
});

test("should throw error when triggerKey is not valid", async () => {
  const promotion = _.cloneDeep(CreateOrderPromotion);
  promotion.triggers[0].triggerKey = "invalid";
  try {
    await createPromotion(mockContext, promotion);
  } catch (error) {
    expect(error.error).toEqual("invalid-params");
    expect(error.message).toEqual("No trigger found with key invalid");
  }
});
