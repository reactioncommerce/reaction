import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import publishNavigationChangesMutation from "./publishNavigationChanges.js";

const mockTreeItems = [
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
];
const mockDraftNavigationTree = {
  _id: "pkMTWAEHJrsiNzY2a",
  shopId: "123",
  name: "Main Navigation",
  draftItems: mockTreeItems,
  items: [],
  hasUnpublishedChanges: true
};
const mockPublishedNavigationTree = {
  _id: "pkMTWAEHJrsiNzY2a",
  shopId: "123",
  name: "Main Navigation",
  draftItems: mockTreeItems,
  items: mockTreeItems,
  hasUnpublishedChanges: false
};
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

test("Calls NavigationTrees.findOne and updateOne, and NavigationItems.findOne, and returns the updated tree", async () => {
  mockContext.collections.NavigationTrees.findOne
    .mockReturnValueOnce(Promise.resolve(mockDraftNavigationTree))
    .mockReturnValueOnce(Promise.resolve(mockPublishedNavigationTree));
  mockContext.collections.NavigationItems.findOne
    .mockReturnValueOnce(Promise.resolve(mockNavigationItem))
    .mockReturnValueOnce(Promise.resolve(mockNavigationItem))
    .mockReturnValueOnce(Promise.resolve(mockNavigationItem));

  mockContext.queries.primaryShopId = jest.fn().mockName("queries.primaryShopId").mockReturnValueOnce(Promise.resolve("FAKE_SHOP_ID"));

  const navigationTree = await publishNavigationChangesMutation(mockContext, "123");

  expect(mockContext.collections.NavigationTrees.findOne).toHaveBeenCalledTimes(2);
  expect(mockContext.collections.NavigationTrees.updateOne).toHaveBeenCalledTimes(1);
  expect(mockContext.collections.NavigationItems.findOne).toHaveBeenCalledTimes(3);

  expect(navigationTree).toEqual(mockPublishedNavigationTree);
});

test("throws an error if the user does not have the core permission", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  const result = publishNavigationChangesMutation(mockContext, "123");
  expect(result).rejects.toThrow();
});

test("throws an error if the navigation tree does not exist", async () => {
  mockContext.collections.NavigationTrees.findOne.mockReturnValueOnce(Promise.resolve(null));
  const result = publishNavigationChangesMutation(mockContext, "123");
  expect(result).rejects.toThrow();
});
