import { PackageConfig } from "/lib/collections/schemas";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name S3SettingsConfig
 * @memberof Schemas
 * @type {SimpleSchema}
 */
export const S3SettingsConfig = PackageConfig.clone().extend({
  // Remove blackbox: true from settings obj
  "settings": {
    type: Object,
    optional: true,
    blackbox: false,
    defaultValue: {}
  },
  "settings.accessKey": {
    type: String,
    label: "Access Key",
    optional: true
  },
  "settings.secretAccessKey": {
    type: String,
    label: "Secret Access Key",
    optional: true
  },
  "settings.bucket": {
    type: String,
    label: "Bucket",
    optional: true
  }
});

registerSchema("S3SettingsConfig", S3SettingsConfig);

/**
 * @name SFTPSettingsConfig
 * @memberof Schemas
 * @type {SimpleSchema}
 */
export const SFTPSettingsConfig = PackageConfig.clone().extend({
  // Remove blackbox: true from settings obj
  "settings": {
    type: Object,
    optional: true,
    blackbox: false,
    defaultValue: {}
  },
  "settings.ipAddress": {
    type: String,
    label: "IP Address",
    optional: true
  },
  "settings.port": {
    type: Number,
    label: "Port",
    optional: true
  },
  "settings.username": {
    type: String,
    label: "Username",
    optional: true
  },
  "settings.password": {
    type: String,
    label: "Password",
    optional: true
  }
});

registerSchema("SFTPSettingsConfig", SFTPSettingsConfig);
