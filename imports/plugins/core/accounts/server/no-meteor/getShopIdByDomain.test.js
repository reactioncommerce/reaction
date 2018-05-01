import getShopIdByDomain from "./getShopIdByDomain";
import mockContext from "/imports/test-utils/helpers/mockContext";

test("returns null if ROOT_URL not set", async () => {
  const previous = process.env.ROOT_URL;
  delete process.env.ROOT_URL;
  const result = await getShopIdByDomain(mockContext.collections);
  process.env.ROOT_URL = previous;
  expect(result).toBe(null);
});

test("calls Shops.findOne with hostname query and returns result", async () => {
  mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve({ _id: "RESULT_ID" }));
  const previous = process.env.ROOT_URL;
  process.env.ROOT_URL = "https://my.domain.com/";
  const result = await getShopIdByDomain(mockContext.collections);
  process.env.ROOT_URL = previous;
  expect(mockContext.collections.Shops.findOne).toHaveBeenCalledWith({
    domains: "my.domain.com"
  }, {
    fields: {
      _id: 1
    }
  });
  expect(result).toBe("RESULT_ID");
});
