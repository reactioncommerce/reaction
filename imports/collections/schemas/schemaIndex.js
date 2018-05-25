import SimpleSchema from "simpl-schema";

SimpleSchema.extendOptions([
  "index", // one of Number, String, Boolean
  "unique", // Boolean
  "sparse" // Boolean
]);
