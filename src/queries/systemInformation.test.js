import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import systemInformation from "./systemInformation.js";

const fakeShopId = "FAKE_SHOP_ID";
mockContext.validatePermissions = jest.fn("validatePermissions");
// mockContext.app = {};
mockContext.app = { db: { admin: jest.fn("admin") } };

beforeEach(() => {
  jest.resetAllMocks();
});

test("throws access-denied if not allowed", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  const result = systemInformation(mockContext, fakeShopId);
  return expect(result).rejects.toThrowErrorMatchingSnapshot();
});
