import * as Schemas from "/lib/collections/schemas";

Schemas.LaunchdockPackageConfig = new SimpleSchema([
  Schemas.PackageConfig, {
    "settings.ssl.domain": {
      type: String,
      label: "Custom Domain"
    },
    "settings.ssl.privateKey": {
      type: String,
      label: "SSL Private Key"
    },
    "settings.ssl.certificate": {
      type: String,
      label: "SSL Certificate"
    }
  }
]);
