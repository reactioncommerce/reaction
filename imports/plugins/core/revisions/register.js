import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Revisions",
  name: "reaction-revisions",
  autoEnable: true,
  settings: {
    general: {
      enabled: true
    }
  },
  registry: [
    // Settings Panel in Catalog
    {
      label: "Product Revisions",
      name: "catalog/settings/revisions/general",
      provides: ["catalogSettings"],
      template: "revisionControlSettings"
    }
  ]
});
