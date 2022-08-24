import createDataLoaders from "./createDataLoaders.js";

const context = {
  collections: {
    SimpleInventory: {
      find: jest.fn(() => ({
        toArray() {
          return [
            {
              _id: "product-1",
              productConfiguration: {
                productVariantId: "variant-1"
              }
            },
            {
              _id: "product-2",
              productConfiguration: {
                productVariantId: "variant-2"
              }
            }
          ];
        }
      }))
    }
  }
};

const dataloaderFactory = (fn) => fn;

test("returns a map with SimpleInventoryByProductVariantId dataloader", () => {
  let dlFn;
  const dlFactory = (fn) => {
    dlFn = fn;
    return fn;
  };
  const dlMap = createDataLoaders(context, dlFactory);
  expect(dlMap.SimpleInventoryByProductVariantId).toEqual(dlFn);
});

test("dataloader function returns correct results", async () => {
  const { SimpleInventoryByProductVariantId } = createDataLoaders(context, dataloaderFactory);
  const results = await SimpleInventoryByProductVariantId(["variant-2", "variant-3", "variant-1"]);
  expect(results).toEqual([
    { _id: "product-2", productConfiguration: { productVariantId: "variant-2" } },
    null,
    { _id: "product-1", productConfiguration: { productVariantId: "variant-1" } }
  ]);
});

test("dataloader function calls SimpleInventory.find() with correct product variant ids", async () => {
  const { SimpleInventoryByProductVariantId } = createDataLoaders(context, dataloaderFactory);
  await SimpleInventoryByProductVariantId(["variant-2", "variant-3", "variant-1"]);
  expect(context.collections.SimpleInventory.find).toHaveBeenCalledWith({
    "productConfiguration.productVariantId": { $in: ["variant-2", "variant-3", "variant-1"] }
  });
});
