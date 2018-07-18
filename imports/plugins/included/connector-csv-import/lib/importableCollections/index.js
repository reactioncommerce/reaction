import { registerImportableCollection } from "@reactioncommerce/reaction-import-connectors";

export const ProductsImpColl = {
  collection: "Products",
  label: "Products",
  importSchema: [
    {
      key: "_id",
      saveToField: "_id",
      label: "ID"
    }
  ]
};

registerImportableCollection(ProductsImpColl);

export const TagsImpColl = {
  collection: "Tags",
  label: "Tags",
  importSchema: [
    {
      key: "_id",
      saveToField: "_id",
      label: "ID"
    }
  ]
};

registerImportableCollection(TagsImpColl);
