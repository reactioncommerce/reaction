import inventoryForProductConfigurations from "./inventoryForProductConfigurations";

const context = {
  dataLoaders: {
    SimpleInventoryByProductVariantId: {
      loadMany: jest.fn(() => [
        {
          _id: "item-1",
          productConfiguration: {
            productVariantId: "variant-1"
          }
        },
        {
          _id: "item-2",
          productConfiguration: {
            productVariantId: "variant-2"
          }
        }
      ])
    }
  }
};

test("calls SimpleInventoryByProductVariantId dataloader with correct product variant ids", async () => {
  const input = {
    productConfigurations: [
      {
        productVariantId: "variant-2"
      },
      {
        productVariantId: "variant-1"
      }
    ]
  };
  await inventoryForProductConfigurations(context, input);
  expect(context.dataLoaders.SimpleInventoryByProductVariantId.loadMany).toHaveBeenCalledWith(["variant-2", "variant-1"]);
});
