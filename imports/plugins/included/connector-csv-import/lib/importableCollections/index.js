export const ProductsImpColl = {
  collection: "Products",
  label: "Products",
  importSchema: [
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

export const TagsImpColl = {
  collection: "Tags",
  label: "Tags",
  importSchema: [
    {
      key: "_id",
      label: "ID",
      optional: true
    },
    {
      key: "name",
      saveToField: "name",
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
