import validateProductConfiguration from "./validateProductConfiguration.js";

test("returns correct errors when payload is not valid", () => {
  const errors = validateProductConfiguration({});
  expect(errors).toEqual([
    "productConfigurationPropertyMissing[productId]",
    "productConfigurationPropertyMissing[productVariantId]"
  ]);
});

test("returns empty array when payload is valid", () => {
  const errors = validateProductConfiguration({
    productId: "product-1",
    productVariantId: "variant-1",
    isSellable: true
  }, true);
  expect(errors).toEqual([]);
});

test("returns errors when requireIsSellable is true and field is not present", () => {
  const errors = validateProductConfiguration({
    productId: "product-1",
    productVariantId: "variant-1"
  }, true);
  expect(errors).toEqual([
    "productConfigurationProperyMustBeBoolean[isSellable]"
  ]);
});

test("returns errors when requireIsSellable is true and field is not Boolean", () => {
  const errors = validateProductConfiguration({
    productId: "product-1",
    productVariantId: "variant-1",
    isSellable: "random string"
  }, true);
  expect(errors).toEqual([
    "productConfigurationProperyMustBeBoolean[isSellable]"
  ]);
});
