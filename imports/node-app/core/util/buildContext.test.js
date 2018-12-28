import mockContext, { resetContext } from "/imports/test-utils/helpers/mockContext";
import buildContext from "./buildContext";

describe("#buildContext", () => {
  let mockAccount;
  let fakeUser;

  beforeEach(() => {
    fakeUser = {
      _id: "FAKE_BUILD_CONTEXT_USER_ID"
    };
    mockAccount = { _id: "accountId", userId: fakeUser._id };

    resetContext();
  });

  test("properly mutates the context object without user", async () => {
    process.env.ROOT_URL = "http://localhost:3000";
    const context = { collections: mockContext.collections };
    await buildContext(context, { user: undefined });
    expect(context).toEqual({
      collections: mockContext.collections,
      shopId: null,
      user: null,
      userHasPermission: jasmine.any(Function),
      userId: null,
      rootUrl: "http://localhost:3000/",
      getAbsoluteUrl: jasmine.any(Function)
    });
  });

  test("properly mutates the context object with user", async () => {
    process.env.ROOT_URL = "https://localhost:3000";
    mockContext.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve(mockAccount));

    const context = { collections: mockContext.collections };
    await buildContext(context, { user: fakeUser });
    expect(context).toEqual({
      account: mockAccount,
      accountId: mockAccount._id,
      collections: mockContext.collections,
      shopId: null,
      user: fakeUser,
      userHasPermission: jasmine.any(Function),
      userId: fakeUser._id,
      rootUrl: "https://localhost:3000/",
      getAbsoluteUrl: jasmine.any(Function)
    });

    // Make sure the hasPermission currying works with one arg
    const result1 = await context.userHasPermission(["foo"]);
    expect(result1).toBe(false);

    // Make sure the hasPermission currying works with two args
    const result2 = await context.userHasPermission(["foo"], "scope");
    expect(result2).toBe(false);
  });

  describe("setting shopId", () => {
    let domain;
    let mockShopId;
    let mockShop;
    let previousRootUrl;

    beforeEach(() => {
      domain = `${randomString()}.reactioncommerce.com`;

      mockAccount = {
        _id: "accountId",
        userId: fakeUser._id
      };
      mockShopId = randomString();
      mockShop = {
        _id: mockShopId
      };

      mockContext.collections.Accounts.findOne
        .mockReturnValueOnce(Promise.resolve(mockAccount));

      previousRootUrl = process.env.ROOT_URL;
    });

    afterEach(() => {
      process.env.ROOT_URL = previousRootUrl;
    });

    test("with User Preference", async () => {
      fakeUser.profile = {
        preferences: {
          reaction: {
            activeShopId: mockShopId
          }
        }
      };

      await buildContext(mockContext, { user: fakeUser });

      expect(mockContext.collections.Shops.findOne).not.toHaveBeenCalled();

      expect(mockContext)
        .toEqual(expect.objectContaining({ shopId: mockShopId }));
    });

    test("with Origin header when present", async () => {
      mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve(mockShop));

      await buildContext(mockContext, {
        user: fakeUser,
        headers: { origin: `https://${domain}/` }
      });

      expect(mockContext.collections.Shops.findOne).toHaveBeenCalledWith({
        domains: domain
      }, expect.anything());

      expect(mockContext)
        .toEqual(expect.objectContaining({ shopId: mockShopId }));
    });

    test("with ROOT_URL when Origin is not present", async () => {
      process.env.ROOT_URL = `https://${domain}/`;

      mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve(mockShop));

      await buildContext(mockContext, { user: fakeUser });

      expect(mockContext.collections.Shops.findOne).toHaveBeenCalledWith({
        domains: domain
      }, expect.anything());

      expect(mockContext)
        .toEqual(expect.objectContaining({ shopId: mockShopId }));
    });

    test("with request hostname (i.e., the API's domain) when ROOT_URL and Origin are not present", async () => {
      delete process.env.ROOT_URL;

      mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve(mockShop));

      await buildContext(mockContext, {
        user: fakeUser,
        hostname: domain,
        protocol: "https"
      });

      expect(mockContext.collections.Shops.findOne).toHaveBeenCalledWith({
        domains: domain
      }, expect.anything());

      expect(mockContext)
        .toEqual(expect.objectContaining({ shopId: mockShopId }));
    });
  });

  function randomString() {
    return Math.random().toString(36);
  }
});
