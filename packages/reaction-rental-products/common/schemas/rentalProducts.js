ReactionCore.Schemas.Coordinates = new SimpleSchema({
  x: {
    label: 'Longitude',
    type: Number,
    decimal: true
  },
  y: {
    label: 'Latitude',
    type: Number,
    decimal: true
  }
});

ReactionCore.Schemas.RentalProductVariant = new SimpleSchema([
  ReactionCore.Schemas.ProductVariant, {
    _id: {
      type: String,
      autoValue: RentalProducts.schemaIdAutoValue,
      index: 1,
      label: 'Variant ID'
    },
    status: {
      type: String,
      optional: true
    },
    location: {
      label: 'Warehouse Storage Location',
      type: String,
      optional: true
    },
    currentLocation: {
      type: ReactionCore.Schemas.Location,
      optional: true
    },
    color: {
      type: String,
      optional: true
    },
    size: {
      type: String,
      optional: true
    },
    alternateSize: {
      type: String,
      optional: true
    },
    manufacturerSku: {
      type: String,
      optional: true
    },
    shopifyTitle: {
      type: String,
      optional: true
    },
    pricePerDay: {
      label: 'Daily Rate',
      type: Number,
      defaultValue: 0.0,
      decimal: true,
      min: 0,
      optional: true
    },
    pricePerWeek: {
      label: 'Weekly Rate',
      type: Number,
      decimal: true,
      min: 0,
      optional: true
    }
  }
]);

ReactionCore.Schemas.RentalProduct = new SimpleSchema([
  ReactionCore.Schemas.Product, {
    variants: {
      type: [ReactionCore.Schemas.RentalProductVariant]
    },
    type: {
      type: String,
      defaultValue: 'rental'
    },
    shopifyTitle: {
      type: String,
      optional: true
    },
    gender: {
      type: String,
      optional: true
    },
    productType: {
      type: String,
      index: 1,
      optional: true
    },
    colors: {
      type: [String],
      optional: true
    },
    cleaningBuffer: {
      type: Number,
      defaultValue: 0,
      optional: true
    },
    shopifyId: {
      type: String,
      optional: true
    },
    handle: {
      type: String,
      optional: true,
      index: 1,
      autoValue: function () {
        let slug = getSlug(this.siblingField('title').value || this.siblingField('_id').value || '');
        if (this.isInsert && !this.value) {
          return slug;
        } else if (this.isUpsert && !this.value) {
          return {
            $setOnInsert: slug
          };
        }
      }
    }
  }
]);

// Update ProductVariant because it's checked against in core in certain methods.
ReactionCore.Schemas.ProductVariant = ReactionCore.Schemas.RentalProductVariant;
ReactionCore.Schemas.Product = ReactionCore.Schemas.RentalProduct;
