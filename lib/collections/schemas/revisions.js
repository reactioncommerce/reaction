import { Workflow } from "./workflow";


export const Revisions = new SimpleSchema({
  _id: {
    type: String,
    label: "Revision Id"
  },

  // status: {
  //   type: String,
  //   label: "Revision Status"
  // },

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
