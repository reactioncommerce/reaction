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
  jobSubType: {
    type: String,
    optional: true,
    label: "Job Sub-type"
  },
  previousJobId: {
    type: String,
    optional: true,
    label: "Previous job",
    index: 1
  },
  shouldExportToS3: {
    type: Boolean,
    optional: true,
    label: "Export to S3"
  },
  shouldExportToSFTP: {
    type: Boolean,
    optional: true,
    label: "Export to SFTP"
  },
  s3ExportFileKey: {
    type: String,
    optional: true,
    label: "S3 Export File Key"
  },
  s3ImportFileKey: {
    type: String,
    optional: true,
    label: "S3 Import File Key"
  },
  sftpExportFilePath: {
    type: String,
    optional: true,
    label: "SFTP Export File Path"
  },
  sftpImportFilePath: {
    type: String,
    optional: true,
    label: "SFTP Import File Path"
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
  fileSource: {
    type: String,
    optional: true,
    label: "File source"
  },
  hasHeader: {
    type: Boolean,
    optional: true,
    label: "First row contains column names?"
  },
  shopId: {
    type: String,
    index: 1,
    label: "Shop",
    optional: true
  },
  userId: {
    type: String,
    optional: true,
    label: "User"
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
  errorFileId: {
    type: String,
    label: "Error File ID",
    optional: true
  },
  exportFileId: {
    type: String,
    label: "Export File ID",
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
