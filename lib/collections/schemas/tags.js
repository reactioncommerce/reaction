/**
 * Tag Schema
 */

ReactionCore.Schemas.Tag = new SimpleSchema({
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
  position: {
    type: Number,
    optional: true
  },
  relatedTagIds: {
    type: [String],
    optional: true,
    index: 1
  },
  isTopLevel: {
    type: Boolean
  },
  shopId: {
    type: String,
    index: 1,
    autoValue: ReactionCore.shopIdAutoValue,
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
