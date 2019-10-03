import convertToDataloaderResult from "@reactioncommerce/api-utils/graphql/convertToDataloaderResult.js";
import createDataLoaders from "./createDataLoaders.js";

const context = {
  collections: {
    Shops: {
      find: jest.fn(() => ({
        toArray() {
          return [
            {
              _id: "shop-1"
            },
            {
              _id: "shop-2"
            }
          ];
        }
      }))
    }
  }
};

const dataloaderFactory = (fn) => fn;

test("returns a map with Shops dataloader", () => {
  let dlFn;
  const dlFactory = (fn) => {
    dlFn = fn;
    return fn;
  };
  const dlMap = createDataLoaders(context, dlFactory, convertToDataloaderResult);
  expect(dlMap.Shops).toEqual(dlFn);
});

test("dataloader function returns correct results", async () => {
  const { Shops } = createDataLoaders(context, dataloaderFactory, convertToDataloaderResult);
  const results = await Shops(["shop-1", "shop-2", "shop-3"]);
  expect(results).toEqual([
    { _id: "shop-1" },
    { _id: "shop-2" },
    null
  ]);
});

test("dataloader function calls Shops.find() with correct shop ids", async () => {
  const { Shops } = createDataLoaders(context, dataloaderFactory, convertToDataloaderResult);
  await Shops(["shop-1"]);
  expect(context.collections.Shops.find).toHaveBeenCalledWith({ _id: { $in: ["shop-1"] } });
});
