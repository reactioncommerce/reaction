import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name NavItem Schema
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary An item in a shop's navigation
 * @property {String} _id The Navigation Item _id
 * @property {String} content The item's content. Can be plain text or HTML.
 * @property {String} url The link URL. Can be left empty to have context wrapped in a <span> instead of <a>.
 * @property {String} parentId The ID of the parent navigation item, if applicable.
 * @property {Number} position The order of the navigation item.
 * @property {String} shopId The _id of the shop this navigation item belongs to.
 * @property {String} styles CSS styles to be added to the <a>/<span> tag
 * @property {Object} metadata Any metadata needed for the navigation item. Sent and received as stringified JSON, but
 *  stored as an object.
 */
export const NavItem = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  content: {
    type: String
  },
  url: {
    type: String,
    optional: true
  },
  parentId: {
    type: String,
    optional: true
  },
  position: {
    type: String
  },
  shopId: {
    type: String
  },
  styles: {
    type: String,
    optional: true
  },
  metadata: {
    type: Object,
    blackbox: true
  }
});

registerSchema("NavItem", NavItem);
