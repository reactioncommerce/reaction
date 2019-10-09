import validateInventoryInput from "./validateInventoryInput.js";

test("returns correct errors when payload is not valid", () => {
  const errors = validateInventoryInput({
    fields: ["foo", "bar"]
  });
  expect(errors).toEqual([
    "inventoryInputMissingField[shopId]",
    "inventoryInputInvalidPropertyValue[productConfigurations]",
    "inventoryInputInvalidFieldsPropertyValue[foo]",
    "inventoryInputInvalidFieldsPropertyValue[bar]"
  ]);
});

test("returns correct errors when productConfigurations are present but not valid", () => {
  const errors = validateInventoryInput({
    productConfigurations: [
      {
        someField: "garbage"
      },
      {
        productId: "product-1",
        productVariantId: "variant-1",
        isSellable: true
      }
    ],
    shopId: "shop-1"
  });
  expect(errors).toEqual([
    "[0].productConfigurationPropertyMissing[productId]",
    "[0].productConfigurationPropertyMissing[productVariantId]",
    "[0].productConfigurationProperyMustBeBoolean[isSellable]"
  ]);
});

test("returns errors when productConfigurations contain a product with no isSellable flag present", () => {
  const errors = validateInventoryInput({
    productConfigurations: [
      {
        productId: "product-2",
        productVariantId: "variant-2",
        isSellable: true
      },
      {
        productId: "product-1",
        productVariantId: "variant-1"
      }
    ],
    shopId: "shop-1"
  });
  expect(errors).toEqual([
    "[1].productConfigurationProperyMustBeBoolean[isSellable]"
  ]);
});
