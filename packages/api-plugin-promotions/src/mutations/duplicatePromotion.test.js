import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import SimpleSchema from "simpl-schema";
import { Promotion as PromotionSchema, Promotion, Trigger, Stackability } from "../simpleSchemas.js";
import duplicatePromotion from "./duplicatePromotion.js";
import { ExistingOrderPromotion } from "./fixtures/orderPromotion.js";

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
mockContext.collections.Promotions.findOne = () => ExistingOrderPromotion;
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


test("duplicates existing promotions and creates new one", async () => {
  try {
    const { success, promotion } = await duplicatePromotion(mockContext, ExistingOrderPromotion._id);
    expect(success).toBeTruthy();
    expect(promotion.name).toEqual("Copy of Order Promotion");
    expect(promotion.referenceId).toEqual(1000000);
    expect(promotion._id).not.toEqual("orderPromotion");
  } catch (error) {
    expect(error).toBeUndefined();
  }
});
