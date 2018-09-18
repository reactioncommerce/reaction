export const ProductsConvMap = {
  collection: "Products",
  label: "Products",
  fields: [
    {
      key: "_id",
      label: "ID",
      optional: true,
      type: String
    },
    {
      key: "title",
      label: "Title",
      type: String
    },
    {
      key: "optionTitle",
      label: "Option title",
      type: String,
      optional: true
    },
    {
      key: "parentId",
      label: "Parent ID",
      optional: true,
      type: String,
      ignoreOnSave: true
    },
    {
      key: "parentTitle",
      label: "Parent title",
      optional: true,
      type: String,
      ignoreOnSave: true
    },
    {
      key: "pageTitle",
      label: "Page title",
      type: String,
      optional: true
    },
    {
      key: "description",
      label: "Description",
      optional: true,
      type: String
    },
    {
      key: "slug",
      label: "Slug",
      optional: true,
      type: String,
      ignoreOnSave: true
    },
    {
      key: "vendor",
      label: "Vendor",
      optional: true,
      type: String
    },
    {
      key: "originCountry",
      label: "Origin Country",
      optional: true,
      type: String
    },
    {
      key: "tagIds",
      label: "Tag IDs",
      optional: true,
      type: Array,
      ignoreOnSave: true
    },
    {
      key: "tagSlugs",
      label: "Tag Slugs",
      optional: true,
      type: Array,
      ignoreOnSave: true
    },
    {
      key: "metafields",
      label: "Metafields",
      optional: true,
      type: Array
    },
    {
      key: "isVisible",
      label: "Is Visible",
      optional: true,
      type: Boolean
    },
    {
      key: "height",
      label: "Height",
      optional: true,
      type: Number
    },
    {
      key: "width",
      label: "Width",
      optional: true,
      type: Number
    },
    {
      key: "width",
      label: "Width",
      optional: true,
      type: Number
    },
    {
      key: "weight",
      label: "Weight",
      optional: true,
      type: Number
    },
    {
      key: "price",
      label: "Price",
      optional: true,
      type: Number
    },
    {
      key: "comparesAtPrice",
      label: "Compares at price",
      optional: true,
      type: Number
    },
    {
      key: "taxable",
      label: "Taxable",
      optional: true,
      type: Number
    },
    {
      key: "taxCode",
      label: "Tax Code",
      optional: true,
      type: String
    },
    {
      key: "images",
      label: "Images",
      optional: true,
      type: Array,
      ignoreOnSave: true
    },
    {
      key: "inventoryManagement",
      label: "Track inventory?",
      optional: true,
      type: Boolean
    },
    {
      key: "inventoryPolicy",
      label: "Allow backorder?",
      optional: true,
      type: Boolean
    },
    {
      key: "inventoryQuantity",
      label: "Quantity",
      optional: true,
      type: Number
    },
    {
      key: "lowInventoryWarningThreshold",
      label: "Quantity",
      optional: true,
      type: Number
    },
    {
      key: "supportedFulfillmentTypes",
      label: "Fulfillment types",
      optional: true,
      type: Array
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
