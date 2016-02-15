ReactionCore.Schemas.ShopifyProducts = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
    label: 'Product Import ID'
  },
  status: {
    type: String,
    defaultValue: 'Fetching Products...'
  },
  currentProductId: {
    type: String,
    optional: true
  },
  currentProductTitle: {
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
  }
});
