/**
 * ReactionCore Schemas Email
 */

ReactionCore.Schemas.Profile = new SimpleSchema({
  addressBook: {
    type: [ReactionCore.Schemas.Address],
    optional: true
  },
  name: {
    type: String,
    optional: true
  },
  picture: {
    type: String,
    optional: true
  }
});

ReactionCore.Schemas.Email = new SimpleSchema({
  provides: {
    type: String,
    defaultValue: "default",
    optional: true
  },
  address: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  verified: {
    type: Boolean,
    defaultValue: false,
    optional: true
  }
});

/**
 * ReactionCore Schemas Accounts
 */

ReactionCore.Schemas.Accounts = new SimpleSchema({
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
    label: "Accounts ShopId"
  },
  sessions: {
    type: [String],
    optional: true,
    index: 1
  },
  shopId: {
    type: String,
    autoValue: ReactionCore.shopIdAutoValue,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  emails: {
    type: [ReactionCore.Schemas.Email],
    optional: true
  },
  acceptsMarketing: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  state: {
    type: String,
    defaultValue: "new",
    optional: true
  },
  note: {
    type: String,
    optional: true
  },
  profile: {
    type: ReactionCore.Schemas.Profile,
    optional: true
  },
  metafields: {
    type: [ReactionCore.Schemas.Metafield],
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
