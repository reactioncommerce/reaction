import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import Logger from "@reactioncommerce/logger";
import systemInformation from "./systemInformation.js";

jest.mock("@reactioncommerce/logger", () => ({
  error: jest.fn().mockImplementationOnce(() => {})
}));

const fakeShopId = "FAKE_SHOP_ID";
mockContext.appVersion = "1.2.3";
mockContext.validatePermissions = jest.fn("validatePermissions");
mockContext.app = {
  db: { admin: jest.fn("admin") },
  registeredPlugins: {
    "plugin-a": {
      label: "Plugin A",
      name: "plugin-a",
      version: "1.0.0"
    },
    "plugin-b": {
      label: "Plugin B",
      name: "plugin-b",
      version: "1.1.0"
    },
    "plugin-c": {
      label: "Plugin C",
      name: "plugin-c",
      version: "1.0.2"
    },
    "plugin-d": {
      label: "Plugin D",
      name: "plugin-d",
      version: "2.0.0"
    }
  }
};

const mongoAdmin = {};
mongoAdmin.serverStatus = jest.fn("serverStatus");

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

test("returns system info if user has permission", async () => {
  const expectedResult = {
    apiVersion: "1.2.3",
    mongoVersion: { version: "4.2.0" },
    plugins: [
      { name: "plugin-a", version: "1.0.0" },
      { name: "plugin-b", version: "1.1.0" },
      { name: "plugin-c", version: "1.0.2" },
      { name: "plugin-d", version: "2.0.0" }
    ]
  };

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));
  mockContext.app.db.admin.mockReturnValueOnce(Promise.resolve(mongoAdmin));
  mongoAdmin.serverStatus.mockReturnValueOnce(Promise.resolve({ version: "4.2.0" }));
  const result = await systemInformation(mockContext, fakeShopId);

  return expect(result).toEqual(expectedResult);
});

test("returns plugins even when mongoVersion fails to load", async () => {
  const expectedResult = {
    apiVersion: "1.2.3",
    mongoVersion: { version: "" },
    plugins: [
      { name: "plugin-a", version: "1.0.0" },
      { name: "plugin-b", version: "1.1.0" },
      { name: "plugin-c", version: "1.0.2" },
      { name: "plugin-d", version: "2.0.0" }
    ]
  };

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));
  mockContext.app.db.admin.mockReturnValueOnce(Promise.resolve(mongoAdmin));
  mongoAdmin.serverStatus.mockRejectedValueOnce(new Error("Simulate serverStatus() error."));
  const simulatedError = new Error("Simulate serverStatus() error.");

  const result = await systemInformation(mockContext, fakeShopId);

  expect(result).toEqual(expectedResult);
  expect(Logger.error).toHaveBeenCalledWith(simulatedError);
});
