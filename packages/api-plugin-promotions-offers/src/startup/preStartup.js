import SimpleSchema from "simpl-schema";

const Event = new SimpleSchema({
  type: String,
  params: {
    type: Object,
    optional: true,
    blackbox: true
  }
});


export const OfferRule = new SimpleSchema({
  name: String,
  conditions: {
    type: Object,
    blackbox: true
  },
  event: {
    type: Event
  }
});


export default async function preStartupOffers(context) {
  const { simpleSchemas: { Promotion } } = context;
  Promotion.extend({
    offerRule: {
      type: OfferRule
    }
  });
}
