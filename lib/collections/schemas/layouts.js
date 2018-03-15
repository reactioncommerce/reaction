import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * @name LayoutStructure
 * @memberof schemas
 * @type {SimpleSchema}
 * @summary Layout are used by the Shops and Packages schemas.
 * Layouts are used to in two ways: 1) Define the template layout on the site
 * 2) Define workflow components used in each layout block
 * @description Read more about Layouts in {@link https://docs.reactioncommerce.com/reaction-docs/master/layout documentation}
 * @property {String} template optional
 * @property {String} layoutHeader optional
 * @property {String} layoutFooter optional
 * @property {String} notFound optional
 * @property {String} dashboardHeader optional
 * @property {String} dashboardControls optional
 * @property {String} dashboardHeaderControls optional
 * @property {String} adminControlsFooter optional
 */
export const LayoutStructure = new SimpleSchema({
  template: {
    type: String,
    optional: true,
    index: true
  },
  layoutHeader: {
    type: String,
    optional: true,
    index: true
  },
  layoutFooter: {
    type: String,
    optional: true,
    index: true
  },
  notFound: {
    type: String,
    optional: true,
    index: true
  },
  dashboardHeader: {
    type: String,
    optional: true,
    index: true
  },
  dashboardControls: {
    type: String,
    optional: true,
    index: true
  },
  dashboardHeaderControls: {
    type: String,
    optional: true,
    index: true
  },
  adminControlsFooter: {
    type: String,
    optional: true,
    index: true
  }
}, { check, tracker: Tracker });

registerSchema("LayoutStructure", LayoutStructure);

/**
 * @name Layout
 * @memberof schemas
 * @type {SimpleSchema}
 * @summary Layout are used by the Shops and Packages schemas.
 * Read more about Layouts in {@link https://docs.reactioncommerce.com/reaction-docs/master/layout documentation}
 * @property {String} layout optional
 * @property {String} workflow optional
 * @property {String} template optional
 * @property {String} collection optional
 * @property {String} theme optional
 * @property {Boolean} enabled default value: `true`
 * @property {String} status optional
 * @property {String} label optional
 * @property {String} container optional
 * @property {String[]} audience optional
 * @property {LayoutStructure} structure optional
 * @property {Number} priority optional default value: `999` - Layouts are prioritized with lower numbers first.
 * @property {Number} position optional default value: `1`
 */
export const Layout = new SimpleSchema({
  "layout": {
    type: String,
    optional: true,
    index: true
  },
  "workflow": {
    type: String,
    optional: true
  },
  "template": {
    type: String,
    optional: true
  },
  "collection": {
    type: String,
    optional: true
  },
  "theme": {
    type: String,
    optional: true
  },
  "enabled": {
    type: Boolean,
    defaultValue: true
  },
  "status": {
    type: String,
    optional: true
  },
  "label": {
    type: String,
    optional: true
  },
  "container": {
    type: String,
    optional: true
  },
  "audience": {
    type: Array,
    optional: true
  },
  "audience.$": {
    type: String
  },
  "structure": {
    type: LayoutStructure,
    optional: true
  },
  "priority": {
    type: SimpleSchema.Integer,
    optional: true,
    defaultValue: 999
  },
  "position": {
    type: SimpleSchema.Integer,
    optional: true,
    defaultValue: 1
  }
}, { check, tracker: Tracker });

registerSchema("Layout", Layout);
