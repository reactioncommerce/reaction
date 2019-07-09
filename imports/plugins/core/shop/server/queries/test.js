import queries from "./";

const context = {
  dataLoaders: {
    Shops: {
      load: jest.fn(() => [
        {
          _id: 1,
          productConfiguration: {
            productVariantId: "variant-1"
          }
        }
      ])
    }
  }
};

test("shopById calls Shops.load() dataloader", () => {
  queries.shopById(context, "1");
  expect(context.dataLoaders.Shops.load).toHaveBeenCalledWith("1");
});
