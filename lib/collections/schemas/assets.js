import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { registerSchema } from "@reactioncommerce/reaction-collections";

export const Assets = new SimpleSchema({
  type: {
    type: String
  },
  name: {
    type: String,
    optional: true
  },
  /**
   * namespace for i18n. This allows to load translation for custom plugins
   */
  ns: {
    type: String,
    optional: true
  },
  path: {
    type: String,
    optional: true
  },
  content: {
    type: String,
    optional: true
  }
});

registerSchema("Assets", Assets);
