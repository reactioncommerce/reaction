import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import _ from "lodash";
import SimpleSchema from "simpl-schema";
import { Promotion as PromotionSchema, Promotion, Trigger, StackAbility } from "../simpleSchemas.js";
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

StackAbility.extend({
  key: {
    allowedValues: [...StackAbility.getAllowedValuesForKey("key"), ...stackAbilities]
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
