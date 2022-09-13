import SimpleSchema from "simpl-schema";


function extendCartSchema(context) {
  const { simpleSchemas: { Cart, Promotion } } = context; // we get this here rather than importing it to get the extended version
  const CartWarning = new SimpleSchema({
    promotion: {
      type: Promotion
    },
    rejectionReason: {
      type: String,
      allowedValues: ["cannot-be-combined", "expired"]
    }
  });
  const PromotionUpdateRecord = new SimpleSchema({
    "updatedAt": Date,
    "promotionsAdded": {
      type: Array
    },
    "promotionsAdded.$": {
      type: Promotion
    },
    "promotionsRemoved": {
      type: Array
    },
    "promotionsRemoved.$": {
      type: Promotion
    }
  });

  Cart.extend({
    "promotionHistory": {
      type: Array,
      optional: true
    },
    "promotionHistory.$": {
      type: PromotionUpdateRecord
    },
    "appliedPromotions": {
      type: Array,
      optional: true
    },
    "appliedPromotions.$": {
      type: Promotion
    },
    "promotionMessages": {
      type: Array,
      optional: true
    },
    "promotionMessages.$": {
      type: CartWarning
    }
  });
}


export default function preStartupPromotions(context) {
  extendCartSchema(context);
}
