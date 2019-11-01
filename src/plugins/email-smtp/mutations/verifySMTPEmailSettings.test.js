import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import verifySMTPEmailSettings from "./verifySMTPEmailSettings.js";

beforeEach(() => {
  jest.resetAllMocks();
});

const host = "smtp.email.com";
const port = 123;
const service = "smtp-email";
const shopId = "SHOP_ID";
const user = "testUser";
const password = "testPassword";

test("throws if permission check fails", async () => {
  mockContext.validatePermissionsLegacy.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });

  await expect(verifySMTPEmailSettings(mockContext, {
    host,
    port,
    service,
    shopId,
    user,
    password
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.validatePermissionsLegacy).toHaveBeenCalledWith(["owner", "admin", "dashboard"], "SHOP_ID");
});

test("throws if password isn't supplied", async () => {
  mockContext.validatePermissionsLegacy.mockReturnValueOnce(Promise.resolve(null));

  await expect(verifySMTPEmailSettings(mockContext, {
    host,
    port,
    service,
    shopId,
    user
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if service isn't supplied", async () => {
  mockContext.validatePermissionsLegacy.mockReturnValueOnce(Promise.resolve(null));

  await expect(verifySMTPEmailSettings(mockContext, {
    host,
    password,
    port,
    shopId,
    user
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if user isn't supplied", async () => {
  mockContext.validatePermissionsLegacy.mockReturnValueOnce(Promise.resolve(null));

  await expect(verifySMTPEmailSettings(mockContext, {
    host,
    port,
    service,
    shopId,
    password
  })).rejects.toThrowErrorMatchingSnapshot();
});
