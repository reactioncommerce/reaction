// ReactionCore.Collections.LocalDelivery = LocalDelivery = this.LocalDelivery = new Mongo.Collection('LocalDelivery');

ReactionCore.Schemas.LocalDeliveryPackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig, {
    'settings.mapbox.key': {
      type: String,
      label: 'Map Box Api Key',
      optional: true
    },
    'settings.mapbox.id': {
      type: String,
      label: 'The MapBox id from element',
      optional: true
    },
    'settings.googlemap.key': {
      type: String,
      label: 'Google Maps Api Key for GeoCoding',
      optional: true
    }
  }
]);

ReactionCore.Schemas.Coordinate = new SimpleSchema({
  coordinate: {
    type: Number,
    optional: true,
    decimal: true
  }
});

ReactionCore.Schemas.Geography = new SimpleSchema({
  type: {
    type: String,
    optional: true
  },
  coordinates: {
    type: [Number],
    optional: true,
    maxCount: 2,
    decimal: true
  }
});

ReactionCore.Schemas.GeoJsonProperties  = new SimpleSchema({
  'title': {
    type: String,
    optional: true
  },
  'description': {
    type: String,
    optional: true
  },
  'marker-symbol': {
    type: String,
    optional: true
  },
  'marker-color': {
    type: String,
    optional: true
  }
});

ReactionCore.Schemas.GeoJson = new SimpleSchema({
  type: {
    type: String,
    optional: true
  },
  geometry: {
    type: ReactionCore.Schemas.Geography,
    optional: true
  },
  properties: {
    type: ReactionCore.Schemas.GeoJsonProperties,
    optional: true
  }
});

ReactionCore.Schemas.LocalDelivery = new SimpleSchema({
  delivererId: {
    type: String,
    optional: true
  },
  deliveryDate: {
    type: Date,
    optional: true
  },
  deliveryStatus: {
    type: String,
    optional: true
  },
  geoJson: {
    type: ReactionCore.Schemas.GeoJson,
    optional: true
  },
  pickUp: {
    type: Boolean,
    optional: true
  },
  location: {
    type: String,
    optional: true
  }
});

ReactionCore.Schemas.LocalDeliveryOnOrder = new SimpleSchema([ReactionCore.Schemas.Orders, {
  delivery: {
    type: ReactionCore.Schemas.LocalDelivery,
    optional: true
  }
}]);

ReactionCore.Collections.Orders.attachSchema(ReactionCore.Schemas.LocalDeliveryOnOrder);
