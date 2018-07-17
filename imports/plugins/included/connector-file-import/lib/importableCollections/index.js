import { registerImportableCollection } from "@reactioncommerce/reaction-import-connectors";

registerImportableCollection({
  collection: "Products",
  importSchema: [
    {
      key: "_id",
      simpleSchemaKey: "_id",
      label: "ID",
      required: false
    }
  ]
});
