import updateNavigationTreeMutation from "./updateNavigationTree.js";

const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const mockNavigationTreeItems = [
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
const mockInput = {
  id: "cmVhY3Rpb24vbmF2aWdhdGlvblRyZWU6cGtNVFdBRUhKcnNpTnpZMmE=",
  shopId: opaqueShopId,
  navigationTree: {
    draftItems: [
      {
        navigationItemId: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06dWFYWGF3YzVveHk5ZVI0aFA=",
        items: [
          {
            navigationItemId: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06dEFLQVRRZXFvRDRBaDVnZzI="
          }
        ]
      },
      {
        navigationItemId: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06S0VjbjZOdnJSdXp0bVBNcTg="
      }
    ],
    name: "Main Menu"
  }
};
const mockNavigationTreeResult = {
  _id: "pkMTWAEHJrsiNzY2a",
  shopId: "123",
  name: "Main Menu",
  draftItems: mockNavigationTreeItems,
  items: mockNavigationTreeItems,
  hasUnpublishedChanges: true
};

test("calls mutations.updateNavigationTree and returns the updated tree", async () => {
  const updateNavigationTree = jest.fn()
    .mockName("mutations.updateNavigationTree")
    .mockReturnValueOnce(mockNavigationTreeResult);

  const mockArgs = { input: mockInput };
  const { navigationTree } = await updateNavigationTreeMutation({}, mockArgs, {
    mutations: { updateNavigationTree }
  });

  expect(navigationTree).toEqual(mockNavigationTreeResult);
  expect(updateNavigationTree).toHaveBeenCalled();
});
