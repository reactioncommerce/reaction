import { registerImportableCollection } from "@reactioncommerce/reaction-import-connectors";

export const ProductsImpColl = {
  collection: "Products",
  label: "Products",
  importSchema: [
    {
      key: "_id",
      saveToField: "_id",
      label: "ID"
    },
    {
      key: "title",
      saveToField: "title",
      label: "Title"
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
    },
    {
      key: "name",
      saveToField: "name",
      label: "Name"
    }

  ]
};

registerImportableCollection(TagsImpColl);
