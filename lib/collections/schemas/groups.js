import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const Groups = new SimpleSchema({
  name: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  slug: {
    type: String
  },
  permissions: {
    type: [String],
    optional: true
  },
  shopId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  createdBy: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function () {
      return this.userId || this.value;
    }
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      return new Date;
    }
  }
});


