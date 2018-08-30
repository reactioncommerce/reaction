import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name JobItems
 * @memberof Schemas
 * @type {SimpleSchema}
 */
export const JobItems = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
    label: "ID"
  },
  name: {
    type: String,
    optional: true,
    label: "Job name"
  },
  jobType: {
    type: String,
    optional: true,
    label: "Job type"
  },
  parentJobId: {
    type: String,
    optional: true,
    label: "Job configuration",
    index: 1
  },
  collection: {
    type: String,
    optional: true,
    label: "Collection"
  },
  mappingId: {
    type: String,
    optional: true,
    label: "Mapping"
  }, // can be "default" or Mapping._id
  hasHeader: {
    type: Boolean,
    optional: true,
    label: "First row contains column names?"
  },
  shopId: {
    type: String,
    index: 1,
    label: "Shop"
  },
  userId: {
    type: String,
    optional: true,
    label: "User"
  },
  fileSource: {
    type: String,
    optional: true,
    label: "File source"
  },
  status: {
    type: String,
    optional: true,
    label: "Status"
  },
  uploadedAt: {
    type: Date,
    optional: true
  },
  completedAt: {
    type: Date,
    optional: true
  },
  mapping: {
    label: "Mapping",
    type: Object,
    blackbox: true,
    optional: true
  } // Mapping will be CSV column name to technical field name
});

registerSchema("JobItems", JobItems);
