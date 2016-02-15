ReactionCore.Schemas.RentalShop = new SimpleSchema([
  ReactionCore.Schemas.Shop, {
    rentalShippingBuffer: {
      type: Number,
      optional: true,
      defaultValue: 0
    },
    rentalReturnBuffer: {
      type: Number,
      optional: true,
      defaultValue: 0
    },
    rentalShippingBufferExclusionZipCodes: {
      type: [String],
      optional: true,
      defaultValue: []
    }
  }
]);
