import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import updateNavigationTreeMutation from "./updateNavigationTree.js";

const mockNavigationTreeId = "pkMTWAEHJrsiNzY2a";
const mockNavigationTreeInput = {
  name: "Main Menu",
  draftItems: [
    {
      navigationItemId: "wYWSrwT2bWDE9aHLg",
      items: [
        {
          navigationItemId: "KEcn6NvrRuztmPMq8"
        }
      ]
    },
    {
      navigationItemId: "tAKATQeqoD4Ah5gg2"
    }
  ],
  hasUnpublishedChanges: false
};

const mockNavigationTree = {
  name: "Main Menu",
  draftItems: [
    {
      navigationItemId: "wYWSrwT2bWDE9aHLg",
      items: [
        {
          navigationItemId: "KEcn6NvrRuztmPMq8"
        }
      ]
    },
    {
      navigationItemId: "tAKATQeqoD4Ah5gg2"
    }
  ],
  hasUnpublishedChanges: false
};

const mockInput = {
  navigationTreeId: mockNavigationTreeId,
  shopId: "123"
};

test("calls NavigationTrees.findOne and updateOne, and returns the updated tree", async () => {
  mockContext.collections.NavigationTrees.findOne
    .mockReturnValueOnce(Promise.resolve(mockNavigationTree))
    .mockReturnValueOnce(Promise.resolve(mockNavigationTree));

  mockContext.queries.primaryShopId = jest.fn().mockName("queries.primaryShopId").mockReturnValueOnce(Promise.resolve("FAKE_SHOP_ID"));
  mockContext.queries.appSettings = jest.fn().mockName("queries.appSettings").mockReturnValueOnce(Promise.resolve({
    shouldNavigationTreeItemsBeAdminOnly: false,
    shouldNavigationTreeItemsBeSecondaryNavOnly: false,
    shouldNavigationTreeItemsBePubliclyVisible: false
  }));

  const updatedNavigationTree = await updateNavigationTreeMutation(mockContext, {
    ...mockInput,
    navigationTree: mockNavigationTreeInput
  });

  expect(mockContext.collections.NavigationTrees.findOne).toHaveBeenCalledTimes(2);
  expect(mockContext.collections.NavigationTrees.updateOne).toHaveBeenCalled();
  expect(mockContext.queries.appSettings).toHaveBeenCalled();
  expect(updatedNavigationTree).toEqual(mockNavigationTree);
});

test("throws an error if the user does not have the core permission", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  const result = updateNavigationTreeMutation(mockContext, mockInput);
  expect(result).rejects.toThrow();
});

test("throws an error if the navigation tree does not exist", async () => {
  mockContext.collections.NavigationTrees.findOne.mockReturnValueOnce(Promise.resolve(null));
  const result = updateNavigationTreeMutation(mockContext, mockInput);
  expect(result).rejects.toThrow();
});
