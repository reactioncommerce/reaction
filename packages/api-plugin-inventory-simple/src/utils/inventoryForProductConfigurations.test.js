import inventoryForProductConfigurations from "./inventoryForProductConfigurations.js";

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
  },
  collections: {
    SimpleInventory: {
      find: jest.fn(() => ({
        toArray() {
          return [];
        },
        limit() {
          return this;
        }
      }))
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

test("calls SimpleInventory.find() on Mongo Collection when DataLoader is not registered", async () => {
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

  const newContext = { ...context };
  delete newContext.dataLoaders;

  await inventoryForProductConfigurations(newContext, input);
  expect(context.collections.SimpleInventory.find).toHaveBeenCalledWith({ "productConfiguration.productVariantId": { $in: ["variant-2", "variant-1"] } });
});
