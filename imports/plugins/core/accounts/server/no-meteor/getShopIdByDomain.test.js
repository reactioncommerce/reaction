import getShopIdByDomain from "./getShopIdByDomain";
import mockContext, { resetContext } from "/imports/test-utils/helpers/mockContext";

describe.only("#getShopIdByDomain", () => {
  beforeEach(resetContext);

  test("returns the origin of the request", async () => {
    const origin = "test.reactioncommerce.com";
    mockContext.rootUrl = `https://${origin}`;

    await getShopIdByDomain(mockContext);

    expect(mockContext.collections.Shops.findOne).toHaveBeenCalledWith({
      domains: origin
    }, expect.anything());
  });

  test("returns null if context.rootUrl not set", async () => {
    delete mockContext.rootUrl;

    const result = await getShopIdByDomain(mockContext);

    expect(result).toBe(null);
  });

  test("calls Shops.findOne with hostname query and returns result", async () => {
    mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve({ _id: "RESULT_ID" }));
    mockContext.rootUrl = "https://my.domain.com/";

    const result = await getShopIdByDomain(mockContext);

    expect(mockContext.collections.Shops.findOne).toHaveBeenCalledWith({
      domains: "my.domain.com"
    }, {
      fields: {
        _id: 1
      }
    });
    expect(result).toBe("RESULT_ID");
  });
});
