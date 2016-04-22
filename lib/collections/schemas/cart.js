/**
 * CartItem Schema
 */

ReactionCore.Schemas.CartItem = new SimpleSchema({
  _id: {
    type: String
  },
  productId: {
    type: String,
    index: 1
  },
  shopId: {
    type: String,
    autoValue: ReactionCore.shopIdAutoValue,
    index: 1,
    label: "Cart Item shopId",
    optional: true
  },
  quantity: {
    label: "Quantity",
    type: Number,
    min: 0
  },
  variants: {
    type: ReactionCore.Schemas.ProductVariant
  },
  type: {
    label: "Product Type",
    type: String,
    optional: true
  }
});

/**
 * CartItem Schema
 * used in check by inventory/addReserve method
 */

ReactionCore.Schemas.CartItems = new SimpleSchema({
  items: {
    type: [ReactionCore.Schemas.CartItem],
    optional: true
  }
});

/**
 * Cart Schema
 */

ReactionCore.Schemas.Cart = new SimpleSchema({
  shopId: {
    type: String,
    autoValue: ReactionCore.shopIdAutoValue,
    index: 1,
    label: "Cart ShopId"
  },
  userId: {
    type: String,
    unique: true,
    autoValue: function () {
      if (this.isInsert || this.isUpdate) {
        if (!this.isFromTrustedCode) {
          return this.userId;
        }
      } else {
        this.unset();
      }
    }
  },
  sessionId: {
    type: String,
    index: 1
  },
  email: {
    type: String,
    optional: true,
    index: 1,
    regEx: SimpleSchema.RegEx.Email
  },
  items: {
    type: [ReactionCore.Schemas.CartItem],
    optional: true
  },
  shipping: {
    type: [ReactionCore.Schemas.Shipment],
    optional: true,
    blackbox: true
  },
  billing: {
    type: [ReactionCore.Schemas.Payment],
    optional: true,
    blackbox: true
  },
  workflow: {
    type: ReactionCore.Schemas.Workflow,
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
    },
    denyUpdate: true
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      if (this.isUpdate) {
        return {
          $set: new Date
        };
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    },
    optional: true
  }
});
