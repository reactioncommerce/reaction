import updateNavigationItemMutation from "./updateNavigationItem.js";

const mockData = {
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
};
const mockNavigationItemInput = {
  _id: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06dWFYWGF3YzVveHk5ZVI0aFA=",
  draftData: mockData,
  metadata: "{ \"tagId\": \"t1\" }"
};
const mockNavigationItemResult = {
  _id: "n1",
  metadata: { tagId: "t1" },
  createdAt: "2018-11-16T13:09:38.586Z",
  draftData: mockData
};

test("calls mutations.updateNavigationItem and returns the updated item", async () => {
  const updateNavigationItem = jest.fn()
    .mockName("mutations.updateNavigationItem")
    .mockReturnValueOnce(mockNavigationItemResult);

  const mockArgs = { input: { navigationItem: mockNavigationItemInput } };
  const { navigationItem } = await updateNavigationItemMutation({}, mockArgs, {
    mutations: { updateNavigationItem }
  });

  expect(navigationItem).toEqual(mockNavigationItemResult);
  expect(updateNavigationItem).toHaveBeenCalled();
});
