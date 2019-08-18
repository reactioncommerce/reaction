import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";
import findAndConvertInBatches from "../no-meteor/util/findAndConvertInBatches";

const defaultVariantLabel = "Variant";
const defaultOptionLabel = "Option";

Migrations.add({
  version: 66,
  async up() {
    const {
      Catalog,
      Cart,
      Products
    } = rawCollections;

    // Add `attributeLabel` to all existing product variants. It's not required,
    // but it is required when publishing them to the catalog, and we want to
    // avoid unexpected errors when publishing.
    await Products.updateMany({
      "ancestors.1": { $exists: false },
      "attributeLabel": null,
      "type": "variant"
    }, {
      $set: {
        attributeLabel: defaultVariantLabel
      }
    });

    // Same for option variants
    await Products.updateMany({
      "ancestors.1": { $exists: true },
      "attributeLabel": null,
      "type": "variant"
    }, {
      $set: {
        attributeLabel: defaultOptionLabel
      }
    });

    // Similarly, update all `Catalog` docs
    await Catalog.updateMany({}, {
      $set: {
        "product.variants.$[variantWithNoAttrLabel].attributeLabel": defaultVariantLabel,
        "product.variants.$[variantWithOptions].options.$[optionWithNoAttrLabel].attributeLabel": defaultOptionLabel
      }
    }, {
      arrayFilters: [
        { "variantWithOptions.options": { $exists: true } },
        { "variantWithNoAttrLabel.attributeLabel": null },
        { "optionWithNoAttrLabel.attributeLabel": null }
      ]
    });

    // In all carts, set all attribute labels that are null because the label is
    // now required.
    await findAndConvertInBatches({
      collection: Cart,
      async converter(cart) {
        if (Array.isArray(cart.items)) {
          for (const item of cart.items) {
            if (Array.isArray(item.attributes)) {
              const attr1 = item.attributes[0];
              if (attr1 && !attr1.label) {
                attr1.label = defaultVariantLabel;
              }

              const attr2 = item.attributes[1];
              if (attr2 && !attr2.label) {
                attr2.label = defaultOptionLabel;
              }
            }
          }
        }

        return cart;
      },
      query: { "items.attributes.label": null }
    });
  }
});
