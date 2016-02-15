ReactionCore.Schemas.RentalOrder = new SimpleSchema([
  ReactionCore.Schemas.Order, {
    startTime: {
      type: Date,
      optional: true
    },
    endTime: {
      type: Date,
      optional: true
    }
  }
]);
