// Bundle colorWays Schema
// 'Underwater Blue/Black': {
//  jacketColor: 'Underwater Blue',
//  jacketId: productIdForJacket,
//  midlayerColor: 'Black',
//  etc..
// }

ReactionCore.Schemas.Bundles = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  shopId: {
    type: String,
    label: 'Shop ID'
  },
  shopifyId: {
    type: String,
    optional: true
  },
  title: {
    type: String,
    optional: true
  },
  description: {
    type: String,
    optional: true
  },
  hasMidlayer: {
    type: Boolean,
    defaultValue: false
  },
  colorWays: {
    type: Object,
    optional: true,
    blackbox: true
  },
  handle: {
    type: String,
    optional: true
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
    },
    optional: true
  }
});
