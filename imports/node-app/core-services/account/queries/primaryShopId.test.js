import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import primaryShopId from "./primaryShopId.js";

test("calls Shops.findOne with hostname query and returns result", async () => {
  mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve({ _id: "CORRECT_SHOP_ID_BY_DOMAIN" }));
  const previous = process.env.ROOT_URL;
  process.env.ROOT_URL = "https://my.domain.com/";
  const result = await primaryShopId(mockContext.collections);
  process.env.ROOT_URL = previous;
  expect(mockContext.collections.Shops.findOne).toHaveBeenCalledWith({
    domains: "my.domain.com"
  }, {
    projection: {
      _id: 1
    }
  });
  expect(result).toBe("CORRECT_SHOP_ID_BY_DOMAIN");
});

test("returns ID of shop with shopType 'primary' if no domain results", async () => {
  mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve(null));
  mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve({ _id: "CORRECT_SHOP_ID_BY_TYPE" }));
  const previous = process.env.ROOT_URL;
  process.env.ROOT_URL = "https://my.domain.com/";
  const result = await primaryShopId(mockContext.collections);
  process.env.ROOT_URL = previous;
  expect(mockContext.collections.Shops.findOne).toHaveBeenCalledWith({
    domains: "my.domain.com"
  }, {
    projection: {
      _id: 1
    }
  });
  expect(mockContext.collections.Shops.findOne).toHaveBeenCalledWith({
    shopType: "primary"
  }, {
    projection: {
      _id: 1
    }
  });
  expect(result).toBe("CORRECT_SHOP_ID_BY_TYPE");
});

test("returns null if ROOT_URL not set and no shop with shopType primary", async () => {
  const previous = process.env.ROOT_URL;
  delete process.env.ROOT_URL;
  const result = await primaryShopId(mockContext.collections);
  process.env.ROOT_URL = previous;
  expect(result).toBe(null);
});
