export const ProductsConvMap = {
  collection: "Products",
  label: "Products",
  fields: [
    {
      key: "_id",
      label: "ID"
    },
    {
      key: "title",
      label: "Title"
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
      optional: true
    },
    {
      key: "name",
      label: "Name"
    },
    {
      key: "slug",
      label: "Slug",
      optional: true
    },
    {
      key: "parentTagId",
      label: "Parent Tag ID",
      optional: true,
      ignoreOnSave: true
    },
    {
      key: "parentTagSlug",
      label: "Parent Tag Slug",
      optional: true,
      ignoreOnSave: true
    },
    {
      key: "isVisible",
      label: "Is Visible",
      optional: true
    }
  ]
};
