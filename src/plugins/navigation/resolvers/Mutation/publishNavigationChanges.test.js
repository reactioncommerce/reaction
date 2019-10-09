import publishNavigationChangesMutation from "./publishNavigationChanges.js";

const mockInput = {
  _id: "cmVhY3Rpb24vbmF2aWdhdGlvblRyZWU6cGtNVFdBRUhKcnNpTnpZMmE="
};
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
const mockNavigationTreeResult = {
  _id: "pkMTWAEHJrsiNzY2a",
  shopId: "123",
  name: "Main Navigation",
  draftItems: mockNavigationTreeItems,
  items: mockNavigationTreeItems,
  hasUnpublishedChanges: false
};

test("calls mutations.publishNavigationChanges and returns the updated tree", async () => {
  const publishNavigationChanges = jest.fn()
    .mockName("mutations.publishNavigationChanges")
    .mockReturnValueOnce(mockNavigationTreeResult);

  const mockArgs = { input: mockInput };
  const { navigationTree } = await publishNavigationChangesMutation({}, mockArgs, {
    mutations: { publishNavigationChanges }
  });

  expect(navigationTree).toEqual(mockNavigationTreeResult);
  expect(publishNavigationChanges).toHaveBeenCalled();
});
