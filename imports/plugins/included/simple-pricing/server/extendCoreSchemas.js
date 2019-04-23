import {
  CatalogProduct,
  CatalogVariantSchema,
  VariantBaseSchema
} from "/imports/collections/schemas";

CatalogProduct.extend({
  pricing: {
    type: Object,
    blackbox: true
  }
});

// Extend the catalog variant database schemas
const variantSchemaExtension = {
  pricing: {
    type: Object,
    blackbox: true
  }
};

VariantBaseSchema.extend(variantSchemaExtension);
CatalogVariantSchema.extend(variantSchemaExtension);
