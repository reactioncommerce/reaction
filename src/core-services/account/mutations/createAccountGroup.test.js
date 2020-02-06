import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import ReactionError from "@reactioncommerce/reaction-error";
import createAccountGroup from "./createAccountGroup.js";

mockContext.validatePermissions = jest.fn("validatePermissions");
mockContext.collections.Groups.insert = jest.fn("collections.Groups.insertOne");
mockContext.collections.Groups.findOne = jest.fn("collections.Groups.findOne");

test("should create a group for the shop", async () => {
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
    permissions: [],
    shopId: "test-shop-id"
  };


  const insertOneRes = {
    ops: [fakeResult]
  };
  mockContext.collections.Groups.insertOne.mockReturnValueOnce(Promise.resolve(insertOneRes));
  mockContext.collections.Groups.findOne.mockReturnValueOnce(Promise.resolve(undefined));

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));

  const result = await createAccountGroup(mockContext, input);
  const expected = Object.assign({}, { group: fakeResult });
  await expect(result).toEqual(expected);

  expect(mockContext.validatePermissions).toHaveBeenCalledWith("reaction:legacy:groups", "create", { shopId });
  expect(mockContext.collections.Groups.findOne).toHaveBeenNthCalledWith(1, { slug: "test-group", shopId });
  expect(mockContext.collections.Groups.insertOne).toHaveBeenCalledWith({
    name: "test group",
    slug: getSlug("test group"),
    permissions: [],
    shopId: "test-shop-id",
    updatedAt: expect.any(Date),
    createdAt: expect.any(Date)
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

  const insertOneRes = {
    ops: [fakeResult]
  };
  mockContext.collections.Groups.insertOne.mockReturnValueOnce(Promise.resolve(insertOneRes));
  mockContext.collections.Groups.findOne
    .mockReturnValueOnce(Promise.resolve(fakeResult))
    .mockReturnValueOnce(Promise.resolve(undefined));

  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));

  await expect(createAccountGroup(mockContext, input)).rejects.toThrow(new ReactionError("conflict", "Group already exist for this shop"));
});
