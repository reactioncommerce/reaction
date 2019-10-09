import updateNavigationTreeMutation from "./updateNavigationTree.js";

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
  _id: "cmVhY3Rpb24vbmF2aWdhdGlvblRyZWU6cGtNVFdBRUhKcnNpTnpZMmE=",
  navigationTree: {
    draftItems: mockNavigationTreeItems,
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
