import { SimpleSchema } from "meteor/aldeed:simple-schema";


export const Notification = new SimpleSchema({
  message: {
    type: String,
    optional: false
  },
  /**
   * Type              Message(This would be the corresponding message)
   * ----------------| -----------------------------------------------
   * orderCancelled  | "Your order was canceled."
   * forAdmin:       | "You have a new order."
   * newOrder:       | "You just made an order."
   * orderDelivered: | "Your order has been delivered."
   * orderProcessing:  | "Your order is being processed."
   * orderShipped:   | "Your order has been shipped."
   */
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
    optional: false,
    defaultValue: "unread"
  },
  timeSent: {
    type: Date,
    optional: false,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset();
    }
  }
});
