import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import { Group } from "../simpleSchemas.js";
import createAccountGroup from "./createAccountGroup.js";

mockContext.validatePermissions = jest.fn("validatePermissions");
mockContext.collections.Groups.insert = jest.fn("collections.Groups.insertOne");
mockContext.collections.Groups.findOne = jest.fn("collections.Groups.findOne");
mockContext.simpleSchemas = { Group };

test("should create a group for the shop", async () => {
  const groupName = "test group";
  const shopId = "test-shop-id";
  const group = {
    name: groupName,
    slug: groupName
  };

  const input = { group, shopId };

  mockContext.collections.Groups.insertOne.mockReturnValueOnce(Promise.resolve(undefined));
  mockContext.collections.Groups.findOne.mockReturnValueOnce(Promise.resolve(undefined));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));

  const result = await createAccountGroup(mockContext, input);

  const expectedGroup = {
    _id: jasmine.any(String),
    createdAt: jasmine.any(Date),
    createdBy: "FAKE_ACCOUNT_ID",
    name: "test group",
    shopId: "test-shop-id",
    slug: "test group",
    updatedAt: jasmine.any(Date)
  };

  await expect(result).toEqual({ group: expectedGroup });

  expect(mockContext.validatePermissions).toHaveBeenCalledWith("reaction:legacy:groups", "create", { shopId });
  expect(mockContext.collections.Groups.findOne).toHaveBeenNthCalledWith(1, { slug: "test group", shopId });
  expect(mockContext.collections.Groups.insertOne).toHaveBeenCalledWith(expectedGroup);
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
    shopId: "test-shop-id"
  };

  mockContext.collections.Groups.insertOne.mockReturnValueOnce(Promise.resolve(undefined));
  mockContext.collections.Groups.findOne.mockReturnValueOnce(Promise.resolve(fakeResult));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));

  await expect(createAccountGroup(mockContext, input)).rejects.toThrow(new ReactionError("conflict", "Group already exist for this shop"));
});
