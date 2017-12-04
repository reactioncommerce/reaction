import {SimpleSchema} from "meteor/aldeed:simple-schema";
import {registerSchema} from "@reactioncommerce/reaction-collections";
import {shopIdAutoValue} from "./helpers";


const StateflowTransitions = new SimpleSchema({
  name: {
    type: String
  },
  from: {
    type: String
  },
  to: {
    type: String
  }
});

export const Stateflow = new SimpleSchema({
  shopId: {
    type: String,
    index: 1,
    autoValue: shopIdAutoValue,
    label: "Stateflow ShopId"
  },
  name: {
    type: String
  },
  workflow: {
    type: String
  },
  collection: {
    type: String,
    optional: true
  },
  querySelector: {
    type: String,
    optional: true
  },
  locationPath: {
    type: String,
    optional: true
  },
  fsm: {
    type: Object
  },
  "fsm.transitions": {
    type: [StateflowTransitions]
  },
  "fsm.init": {
    type: String
  }
});

registerSchema("Stateflow", Stateflow);
