import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * @name Assets
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} type required
 * @property {String} name optional
 * @property {String} ns optional, namespace for i18n. Allows to load translation for custom plugins.
 * @property {String} path optional
 * @property {String} content optional
 */
export const Assets = new SimpleSchema({
  type: {
    type: String
  },
  name: {
    type: String,
    optional: true
  },
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
