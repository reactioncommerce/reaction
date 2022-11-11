import SimpleSchema from "simpl-schema";

export const Sequence = new SimpleSchema({
  shopId: String,
  entity: String,
  value: {
    type: SimpleSchema.Integer,
    min: 0
  }
});
