import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValue } from "./helpers";
import { Metafield } from "./metafield";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * Tag Schema
 */

export const Tag = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    index: 1
  },
  slug: {
    type: String
  },
  type: {
    type: String,
    optional: true
  },
  metafields: {
    type: [Metafield],
    optional: true
  },
  position: {
    type: Number,
    optional: true
  },
  relatedTagIds: {
    type: [String],
    optional: true,
    index: 1
  },
  isDeleted: {
    type: Boolean,
    defaultValue: false
  },
  isTopLevel: {
    type: Boolean
  },
  isVisible: {
    type: Boolean,
    defaultValue: true
  },
  groups: {
    type: [String], // groupIds that this tag belongs to
    optional: true,
    defaultValue: []
  },
  shopId: {
    type: String,
    index: 1,
    autoValue: shopIdAutoValue,
    label: "Tag shopId"
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
    type: Date
  }
});

registerSchema("Tag", Tag);
