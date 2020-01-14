import createNavigationTreeMutation from "./createNavigationTree.js";

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
  shopId: opaqueShopId,
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

test("calls mutations.createNavigationTree and returns the created tree", async () => {
  const createNavigationTree = jest.fn()
    .mockName("mutations.createNavigationTree")
    .mockReturnValueOnce(mockNavigationTreeResult);

  const mockArgs = { input: mockInput };
  const { navigationTree } = await createNavigationTreeMutation({}, mockArgs, {
    mutations: { createNavigationTree }
  });

  expect(navigationTree).toEqual(mockNavigationTreeResult);
  expect(createNavigationTree).toHaveBeenCalled();
});
