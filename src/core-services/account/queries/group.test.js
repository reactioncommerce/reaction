import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import groupQuery from "./group.js";

const fakeShopId = "FAKE_SHOP_ID";
const fakeGroup = { _id: "FAKE_GROUP_ID", name: "fake", shopId: fakeShopId };

beforeEach(() => {
  jest.resetAllMocks();
});

test("throws not-found if the group does not exist", async () => {
  mockContext.collections.Groups.findOne.mockReturnValueOnce(undefined);
  const result = groupQuery(mockContext, fakeGroup._id);
  return expect(result).rejects.toThrowErrorMatchingSnapshot();
});

test("returns the group if userHasPermission returns true", async () => {
  mockContext.collections.Groups.findOne.mockReturnValueOnce(fakeGroup);
  mockContext.userHasPermission.mockReturnValueOnce(true);
  const result = await groupQuery(mockContext, fakeGroup._id);
  expect(mockContext.collections.Groups.findOne).toHaveBeenCalledWith({ _id: fakeGroup._id });
  expect(mockContext.userHasPermission).toHaveBeenCalledWith(
    "reaction:legacy:groups",
    "read",
    { shopId: "FAKE_SHOP_ID" }
  );
  expect(result).toEqual(fakeGroup);
});

test("returns the group if userHasPermission returns false but the current user is in the group", async () => {
  mockContext.collections.Groups.findOne.mockReturnValueOnce(fakeGroup);
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.account = { groups: [fakeGroup._id] };
  const result = await groupQuery(mockContext, fakeGroup._id);
  delete mockContext.account;
  expect(mockContext.collections.Groups.findOne).toHaveBeenCalledWith({ _id: fakeGroup._id });
  expect(mockContext.userHasPermission).toHaveBeenCalledWith(
    "reaction:legacy:groups",
    "read",
    { shopId: "FAKE_SHOP_ID" }
  );
  expect(result).toEqual(fakeGroup);
});

test("throws access-denied if not allowed", async () => {
  mockContext.collections.Groups.findOne.mockReturnValueOnce(fakeGroup);
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);
  const result = groupQuery(mockContext, fakeGroup._id);
  return expect(result).rejects.toThrowErrorMatchingSnapshot();
});
