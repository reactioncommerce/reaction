import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
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
  mockContext.userHasPermission.mockReturnValueOnce(false);

  await expect(verifySMTPEmailSettings(mockContext, {
    host,
    port,
    service,
    shopId,
    user,
    password
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["owner", "admin", "dashboard"], "SHOP_ID");
});

test("throws if password isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(verifySMTPEmailSettings(mockContext, {
    host,
    port,
    service,
    shopId,
    user
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if service isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(verifySMTPEmailSettings(mockContext, {
    host,
    password,
    port,
    shopId,
    user
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if user isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(verifySMTPEmailSettings(mockContext, {
    host,
    port,
    service,
    shopId,
    password
  })).rejects.toThrowErrorMatchingSnapshot();
});
