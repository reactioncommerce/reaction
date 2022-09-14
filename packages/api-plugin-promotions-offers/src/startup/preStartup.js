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


/**
 * @summary Extend Promotions schema with offer rules
 * @param {Object} context - The application context
 * @return {Object} - The extended schema
 */
export default function preStartupOffers(context) {
  const { simpleSchemas: { Promotion } } = context;
  Promotion.extend({
    offerRule: {
      type: OfferRule
    }
  });
  return Promotion;
}
