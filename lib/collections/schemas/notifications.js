import { SimpleSchema } from "meteor/aldeed:simple-schema";


export const Notification = new SimpleSchema({
  message: {
    type: String,
    optional: false
  },
  type: {
    type: String,
    optional: false
  },
  url: {
    type: String,
    optional: false
  },
  to: {
    type: String,
    optional: false
  },
  hasDetails: {
    type: Boolean,
    optional: false
  },
  details: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    optional: false
  },
  timeSent: {
    type: Date,
    optional: false
  }
});
