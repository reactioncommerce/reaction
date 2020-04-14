import queries from "./index.js";

const context = {
  dataLoaders: {
    Shops: {
      load: jest.fn(() => [
        {
          _id: "shop-1"
        }
      ])
    }
  }
};

test("shopById calls Shops.load() dataloader", () => {
  queries.shopById(context, "shop-1");
  expect(context.dataLoaders.Shops.load).toHaveBeenCalledWith("shop-1");
});
