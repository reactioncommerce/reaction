import SimpleSchema from "simpl-schema";

export const Sequence = new SimpleSchema({
  shopId: String,
  entity: String,
  value: SimpleSchema.Integer
});
