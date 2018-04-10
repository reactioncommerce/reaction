import mockContext from "/imports/test-utils/helpers/mockContext";
import { groupQuery, groupsQuery } from "./groupQuery";

const fakeShopId = "FAKE_SHOP_ID";
const fakeGroup = { _id: "FAKE_GROUP_ID", name: "fake", shopId: fakeShopId };
const fakeAccount = { _id: "FAKE_ACCOUNT_ID", groups: ["group1", "group2"] };

beforeEach(() => {
  jest.resetAllMocks();
});

describe("groupQuery", () => {
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
    expect(mockContext.userHasPermission).toHaveBeenCalledWith(["owner", "admin", "reaction-accounts"], fakeGroup.shopId);
    expect(result).toEqual(fakeGroup);
  });

  test("returns the group if userHasPermission returns false but the current user is in the group", async () => {
    mockContext.collections.Groups.findOne.mockReturnValueOnce(fakeGroup);
    mockContext.userHasPermission.mockReturnValueOnce(false);
    mockContext.collections.Accounts.findOne.mockReturnValueOnce(fakeAccount);
    const result = await groupQuery(mockContext, fakeGroup._id);
    expect(mockContext.collections.Groups.findOne).toHaveBeenCalledWith({ _id: fakeGroup._id });
    expect(mockContext.userHasPermission).toHaveBeenCalledWith(["owner", "admin", "reaction-accounts"], fakeGroup.shopId);
    expect(mockContext.collections.Accounts.findOne).toHaveBeenCalledWith({
      _id: mockContext.userId,
      groups: fakeGroup._id
    }, {
      projection: {
        _id: 1
      }
    });
    expect(result).toEqual(fakeGroup);
  });

  test("throws access-denied if not allowed", async () => {
    mockContext.collections.Groups.findOne.mockReturnValueOnce(fakeGroup);
    mockContext.userHasPermission.mockReturnValueOnce(false);
    mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);
    const result = groupQuery(mockContext, fakeGroup._id);
    return expect(result).rejects.toThrowErrorMatchingSnapshot();
  });
});

describe("groupsQuery", () => {
  test("returns the groups cursor if userHasPermission returns true", async () => {
    mockContext.collections.Groups.find.mockReturnValueOnce("CURSOR");
    mockContext.userHasPermission.mockReturnValueOnce(true);
    const result = await groupsQuery(mockContext, fakeShopId);
    expect(mockContext.collections.Groups.find).toHaveBeenCalledWith({ shopId: fakeShopId });
    expect(mockContext.userHasPermission).toHaveBeenCalledWith(["owner", "admin", "reaction-accounts"], fakeShopId);
    expect(result).toBe("CURSOR");
  });

  test("returns the groups cursor for groups the current user is in, if userHasPermission returns false", async () => {
    mockContext.collections.Groups.find.mockReturnValueOnce("CURSOR");
    mockContext.userHasPermission.mockReturnValueOnce(false);
    mockContext.collections.Accounts.findOne.mockReturnValueOnce(fakeAccount);
    const result = await groupsQuery(mockContext, fakeShopId);
    expect(mockContext.collections.Groups.find).toHaveBeenCalledWith({
      _id: { $in: fakeAccount.groups },
      shopId: fakeShopId
    });
    expect(mockContext.userHasPermission).toHaveBeenCalledWith(["owner", "admin", "reaction-accounts"], fakeShopId);
    expect(result).toBe("CURSOR");
  });

  test("throws access-denied if not allowed", async () => {
    mockContext.userHasPermission.mockReturnValueOnce(false);
    mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);
    const result = groupsQuery(mockContext, fakeShopId);
    return expect(result).rejects.toThrowErrorMatchingSnapshot();
  });
});
