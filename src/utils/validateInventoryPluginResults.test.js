import validateInventoryPluginResults from "./validateInventoryPluginResults.js";

test("returns correct errors when payload is not valid", () => {
  const errors = validateInventoryPluginResults([
    {
      inventoryInfo: {},
      productConfiguration: {}
    }
  ]);
  expect(errors).toEqual([
    "[0].productConfigurationPropertyMissing[productId]",
    "[0].productConfigurationPropertyMissing[productVariantId]",
    "[0].inventoryInfoFieldIsNotBoolean[canBackorder]",
    "[0].inventoryInfoFieldIsNotBoolean[isLowQuantity]",
    "[0].inventoryInfoFieldIsNotNumber[inventoryAvailableToSell]",
    "[0].inventoryInfoFieldIsNotNumber[inventoryInStock]",
    "[0].inventoryInfoFieldIsNotNumber[inventoryReserved]"
  ]);
});

test("returns errors only for productConfiguration when inventoryInfo is optional and not present", () => {
  const errors = validateInventoryPluginResults([
    {
      productConfiguration: {}
    }
  ]);
  expect(errors).toEqual([
    "[0].productConfigurationPropertyMissing[productId]",
    "[0].productConfigurationPropertyMissing[productVariantId]"
  ]);
});

test("returns no errors when pluginResults is empty", () => {
  const errors = validateInventoryPluginResults([]);
  expect(errors).toEqual([]);
});
