ReactionCore.Schemas.RentalCartItem = new SimpleSchema([
  ReactionCore.Schemas.CartItem, {
    startTime: {
      type: Date,
      optional: true
    },
    endTime: {
      type: Date,
      optional: true
    },
    productType: {
      type: String,
      optional: true
    },
    variants: {
      type: ReactionCore.Schemas.RentalProductVariant
    }
  }
]);

ReactionCore.Schemas.RentalCart = new SimpleSchema([
  ReactionCore.Schemas.Cart, {
    startTime: {
      type: Date,
      optional: true
    },
    endTime: {
      type: Date,
      optional: true
    },
    rentalMonths: {
      type: Number,
      optional: true
    },
    rentalWeeks: {
      type: Number,
      optional: true
    },
    rentalDays: {
      type: Number,
      optional: true
    },
    rentalHours: {
      type: Number,
      optional: true
    },
    rentalMinutes: {
      type: Number,
      optional: true
    },
    items: {
      type: [ReactionCore.Schemas.RentalCartItem],
      optional: true
    }
  }
]);
