export const ProductsConvMap = {
  collection: "Products",
  label: "Products",
  fields: [
    {
      key: "_id",
      label: "ID",
      type: String
    },
    {
      key: "title",
      label: "Title",
      type: String
    }
  ]
};

export const TagsConvMap = {
  collection: "Tags",
  label: "Tags",
  fields: [
    {
      key: "_id",
      label: "ID",
      optional: true,
      type: String
    },
    {
      key: "name",
      label: "Name",
      type: String
    },
    {
      key: "slug",
      label: "Slug",
      optional: true,
      type: String
    },
    {
      key: "parentTagId",
      label: "Parent Tag ID",
      optional: true,
      ignoreOnSave: true,
      type: String
    },
    {
      key: "parentTagSlug",
      label: "Parent Tag Slug",
      optional: true,
      ignoreOnSave: true,
      type: String
    },
    {
      key: "isVisible",
      label: "Is Visible",
      optional: true,
      type: Boolean
    }
  ]
};
