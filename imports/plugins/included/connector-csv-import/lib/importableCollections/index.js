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

export const TagsImpColl = {
  collection: "Tags",
  label: "Tags",
  importSchema: [
    {
      key: "_id",
      saveToField: "_id",
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
      saveToField: "isVisble",
      label: "Is Visible",
      optional: true
    },
    {
      key: "slug",
      saveToField: "slug",
      label: "Slug",
      optional: true
    },
    {
      key: "relatedTagIds",
      saveToField: "relatedTagIds",
      label: "Related Tags",
      optional: true
    }
  ]
};
