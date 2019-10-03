import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateNavigationItemMutation from "./updateNavigationItem.js";

const mockNavigationItem = {
  _id: "n1",
  createdAt: new Date(),
  metadata: { tagId: "t1" },
  draftData: {
    content: [
      {
        language: "en",
        value: "Home"
      }
    ],
    isUrlRelative: true,
    shouldOpenInNewWindow: false,
    url: "/",
    classNames: "home-link"
  },
  data: {},
  hasUnpublishedChanges: true
};

test("calls NavigationItems.findOne and updateOne, and returns the updated navigation item", async () => {
  mockContext.collections.NavigationItems.findOne
    .mockReturnValueOnce(Promise.resolve(mockNavigationItem))
    .mockReturnValueOnce(Promise.resolve(mockNavigationItem));

  mockContext.queries.primaryShopId = jest.fn().mockName("queries.primaryShopId").mockReturnValueOnce(Promise.resolve("FAKE_SHOP_ID"));

  const result = await updateNavigationItemMutation(mockContext, "n1", { metadata: "{ \"tagId\": \"t1\" }" });

  expect(mockContext.collections.NavigationItems.findOne).toHaveBeenCalledTimes(2);
  expect(mockContext.collections.NavigationItems.updateOne).toHaveBeenCalled();
  expect(result).toEqual(mockNavigationItem);
});

test("throws an error if the user does not have the core permission", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  const result = updateNavigationItemMutation(mockContext, "n1", {});
  expect(result).rejects.toThrow();
});

test("throws an error if the navigation item does not exist", async () => {
  mockContext.collections.NavigationItems.findOne.mockReturnValueOnce(null);
  const result = updateNavigationItemMutation(mockContext, "n1", {});
  expect(result).rejects.toThrow();
});

test("throws an error if invalid JSON metadata is passed", async () => {
  const result = updateNavigationItemMutation(mockContext, "n1", { metadata: "INVALID_JSON" });
  expect(result).rejects.toThrow();
});
