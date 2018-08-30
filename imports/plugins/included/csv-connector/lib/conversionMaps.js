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
      key: "isVisible",
      label: "Is Visible",
      optional: true
    },
    {
      key: "slug",
      label: "Slug",
      optional: true
    },
    {
      key: "parentTag",
      label: "Parent Tag",
      optional: true,
      ignoreOnSave: true
    }
  ]
};
