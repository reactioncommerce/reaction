import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import _ from "lodash";
import SimpleSchema from "simpl-schema";
import { Promotion as PromotionSchema, Promotion, Trigger, Stackability } from "../simpleSchemas.js";
import updatePromotion from "./updatePromotion.js";
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
const updateResults = {
  modifiedCount: 1,
  value: ExistingOrderPromotion
};
mockContext.collections.Promotions.findOneAndUpdate = () => updateResults;
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
  const promotion = { stackability: "all" };
  try {
    await updatePromotion(mockContext, { shopId: promotion.shopId, promotion });
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});

test("will not update a record with no triggers", async () => {
  const promotion = _.cloneDeep(ExistingOrderPromotion);
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
  const promotion = _.cloneDeep(ExistingOrderPromotion);
  promotion.triggers = [];
  try {
    await updatePromotion(mockContext, { shopId: promotion.shopId, promotion });
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});


test("will update a record if it passes validation", async () => {
  const promotionToUpdate = ExistingOrderPromotion;
  promotionToUpdate.enabled = false;
  try {
    const { success, promotion } = await updatePromotion(mockContext, { shopId: promotionToUpdate.shopId, promotion: promotionToUpdate });
    expect(success).toBeTruthy();
    expect(promotion.enabled).toEqual(false);
  } catch (error) {
    expect(error).toBeUndefined();
  }
});
