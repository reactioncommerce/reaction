import { SimpleSchema } from "meteor/aldeed:simple-schema";

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
  data: {
    type: Object,
    blackbox: true
  },
  date: {
    type: Date,
    autoValue() { return new Date(); }
  }
});
