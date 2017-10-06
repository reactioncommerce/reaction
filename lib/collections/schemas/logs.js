import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { registerSchema } from "@reactioncommerce/reaction-collections";

export const Logs = new SimpleSchema({

  logType: {
    type: String
  },
  shopId: {
    type: String
  },
  level: {
    type: String,
    defaultValue: "info",
    allowedValues: ["trace", "debug", "info", "warn", "error", "fatal"]
  },
  source: {
    type: String,
    defaultValue: "server",
    allowedValues: ["client", "server"]
  },
  handled: {
    type: Boolean,
    defaultValue: false
  },
  data: {
    type: Object,
    blackbox: true
  },
  date: {
    type: Date,
    autoValue() { return new Date(); }
  }
});

registerSchema("Logs", Logs);
