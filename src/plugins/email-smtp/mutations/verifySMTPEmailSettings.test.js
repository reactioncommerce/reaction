import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import verifySMTPEmailSettings from "./verifySMTPEmailSettings.js";

beforeEach(() => {
  jest.resetAllMocks();
});

const shopId = "SHOP_ID";

test("throws if permission check fails", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });

  await expect(verifySMTPEmailSettings(mockContext, {
    shopId
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.validatePermissions).toHaveBeenCalledWith("reaction:legacy:emails", "read", { shopId });
});
