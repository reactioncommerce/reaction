import deleteNavigationItemMutation from "./deleteNavigationItem.js";

const mockInput = {
  _id: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06dWFYWGF3YzVveHk5ZVI0aFA="
};
const mockNavigationItemResult = {
  _id: "wYWSrwT2bWDE9aHLg",
  metadata: { tagId: "t1" },
  createdAt: "2018-11-16T13:09:38.586Z",
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
  }
};

test("calls mutations.deleteNavigationItem and returns the deleted item", async () => {
  const deleteNavigationItem = jest.fn()
    .mockName("mutations.deleteNavigationItem")
    .mockReturnValueOnce(mockNavigationItemResult);

  const mockArgs = { input: mockInput };
  const { navigationItem } = await deleteNavigationItemMutation({}, mockArgs, {
    mutations: { deleteNavigationItem }
  });

  expect(navigationItem).toEqual(mockNavigationItemResult);
  expect(deleteNavigationItem).toHaveBeenCalled();
});
