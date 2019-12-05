import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import ReactionError from "@reactioncommerce/reaction-error";
import createGroup from "./createGroup.js";

mockContext.getSlug = jest.fn("getSlug");
mockContext.validatePermissions = jest.fn("validatePermissions");
mockContext.validatePermissionsLegacy = jest.fn("validatePermissionsLegacy");
mockContext.collections.Groups.insert = jest.fn("collections.Groups.insert");
mockContext.collections.Groups.findOne = jest.fn("collections.Groups.findOne");
mockContext.auth = {
  upsertRole: jest.fn("auth.upsertRole")
};

beforeEach (() => jest.resetAllMocks())

test("should create a group for the shop", async () => {
  const groupId = "test-group-id";
  const groupName = "test group";
  const shopId = "test-shop-id";
  const group = {
    name: groupName,
    slug: groupName
  };

  const input = { group, shopId };

  const fakeResult = {
    _id: "test-group-id",
    name: "test group",
    slug: "test group",
    permissions: [
      "dashboard"
    ],
    shopId: "test-shop-id"
  };

  mockContext.collections.Groups.insert.mockReturnValueOnce("test-group-id");
  mockContext.collections.Groups.findOne
    .mockReturnValueOnce(fakeResult)
    .mockReturnValueOnce(undefined)
    .mockReturnValueOnce(fakeResult);

  mockContext.validatePermissionsLegacy.mockReturnValueOnce(Promise.resolve(undefined));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));
  mockContext.getSlug.mockReturnValueOnce(groupName);
  mockContext.auth.upsertRole.mockReturnValueOnce(undefined);

  const result = await createGroup(input, mockContext);
  const expected = Object.assign({}, { group: fakeResult });
  await expect(result).toEqual(expected);

  expect(mockContext.validatePermissionsLegacy).toHaveBeenCalledWith(["admin"], null, { shopId });
  expect(mockContext.validatePermissions).toHaveBeenCalledWith("reaction:account", "create", { shopId });
  expect(mockContext.collections.Groups.findOne).toHaveBeenNthCalledWith(1, { slug: "customer", shopId });
  expect(mockContext.collections.Groups.findOne).toHaveBeenNthCalledWith(2, { slug: "test-group", shopId });
  expect(mockContext.collections.Groups.findOne).toHaveBeenNthCalledWith(3, { _id: groupId });
  expect(mockContext.collections.Groups.insert).toHaveBeenCalledWith({
    name: "test group",
    slug: getSlug("test group"),
    permissions: [
      "dashboard"
    ],
    shopId: "test-shop-id"
  });
});


test("should throw if group already exists", async () => {
  const groupName = "test group";
  const shopId = "test-shop-id";
  const group = {
    name: groupName,
    slug: groupName
  };

  const input = { group, shopId };

  const fakeResult = {
    _id: "test-group-id",
    name: "test group",
    slug: "test group",
    permissions: [
      "dashboard"
    ],
    shopId: "test-shop-id"
  };

  mockContext.collections.Groups.insert.mockReturnValueOnce("test-group-id");
  mockContext.collections.Groups.findOne
    .mockReturnValueOnce(undefined)
    .mockReturnValueOnce(fakeResult);

  mockContext.validatePermissionsLegacy.mockReturnValueOnce(Promise.resolve(undefined));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));
  mockContext.getSlug.mockReturnValueOnce(groupName);

  expect(createGroup(input, mockContext)).rejects.toEqual(new ReactionError("conflict", "Group already exist for this shop"));;
});
