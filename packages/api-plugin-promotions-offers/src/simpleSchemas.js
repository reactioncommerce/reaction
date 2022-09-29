import SimpleSchema from "simpl-schema";

const Event = new SimpleSchema({
  type: String,
  params: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

const OfferRule = new SimpleSchema({
  name: String,
  conditions: {
    type: Object,
    blackbox: true
  },
  event: {
    type: Event
  }
});

export const offerRule = {
  offerRule: {
    type: OfferRule
  }
}
