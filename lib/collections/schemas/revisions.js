import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Workflow } from "./workflow";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * @name Revisions
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} _id Revision Id
 * @property {Workflow} workflow required
 * @property {String} documentId Reference Document Id
 * @property {String} documentType Document Type, default value: `product`, allowed values: `product`, `image`, `tag`
 * @property {String} parentDocument optional
 * @property {"object"} documentData blackbox object
 * @property {String} changeType optional, allowed values: `insert`, `update`, `remove`
 * @property {Object[]} diff optional, blackbox
 * @property {Date} createdAt required
 * @property {Date} updatedAt optional
 * @property {Date} publishAt optional
 */
export const Revisions = new SimpleSchema({
  _id: {
    type: String,
    label: "Revision Id"
  },
  workflow: {
    type: Workflow,
    optional: false
  },
  documentId: {
    type: String,
    label: "Reference Document Id"
  },
  documentType: {
    type: String,
    label: "Document Type",
    defaultValue: "product",
    allowedValues: ["product", "image", "tag"]
  },
  parentDocument: {
    type: String,
    optional: true
  },
  documentData: {
    type: "object",
    blackbox: true
  },
  changeType: {
    type: String,
    optional: true,
    allowedValues: ["insert", "update", "remove"]
  },
  diff: {
    type: [Object],
    blackbox: true,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      return new Date;
    },
    optional: true
  },
  publishAt: {
    type: Date,
    optional: true
  }
});

registerSchema("Revisions", Revisions);
