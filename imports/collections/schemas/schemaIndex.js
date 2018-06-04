import SimpleSchema from "simpl-schema";

// These options are added by the `aldeed:schema-index` Meteor package, but because that
// is a Meteor package and we also load the schemas in a non-Meteor Node app, we need to do it here.
SimpleSchema.extendOptions([
  "index", // one of Number, String, Boolean
  "unique", // Boolean
  "sparse" // Boolean
]);
