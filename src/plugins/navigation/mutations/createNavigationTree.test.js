import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import createNavigationTreeMutation from "./createNavigationTree.js";

const mockNavigationTreeInput = {
  shopId: "123",
  name: "Main Menu",
  draftItems: [
    {
      navigationItemId: "uaXXawc5oxy9eR4hP",
      items: [
        {
          navigationItemId: "tAKATQeqoD4Ah5gg2"
        }
      ]
    },
    {
      navigationItemId: "KEcn6NvrRuztmPMq8"
    }
  ]
};

const mockNavigationTree = {
  name: "Main Menu",
  shopId: "123",
  _id: jasmine.any(String),
  hasUnpublishedChanges: true,
  draftItems: [
    {
      navigationItemId: "uaXXawc5oxy9eR4hP",
      items: [
        {
          navigationItemId: "tAKATQeqoD4Ah5gg2",
          isPrivate: false,
          isSecondary: false,
          isVisible: false
        }
      ],
      isPrivate: false,
      isSecondary: false,
      isVisible: false
    },
    {
      navigationItemId: "KEcn6NvrRuztmPMq8",
      isPrivate: false,
      isSecondary: false,
      isVisible: false
    }
  ]
};

test("creates and returns new navigation tree", async () => {
  mockContext.queries.primaryShopId = jest.fn().mockName("queries.primaryShopId").mockReturnValueOnce(Promise.resolve("FAKE_SHOP_ID"));
  mockContext.queries.appSettings = jest.fn().mockName("queries.appSettings").mockReturnValueOnce(Promise.resolve({
    shouldNavigationTreeItemsBeAdminOnly: false,
    shouldNavigationTreeItemsBeSecondaryNavOnly: false,
    shouldNavigationTreeItemsBePubliclyVisible: false
  }));

  const updatedNavigationTree = await createNavigationTreeMutation(mockContext, mockNavigationTreeInput);
  expect(mockContext.collections.NavigationTrees.insertOne).toHaveBeenCalledTimes(1);
  expect(mockContext.queries.appSettings).toHaveBeenCalled();

  expect(updatedNavigationTree).toEqual(mockNavigationTree);
});

test("throws an error if the user does not have the core permission", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  const result = createNavigationTreeMutation(mockContext, mockNavigationTreeInput);
  expect(result).rejects.toThrow();
});
