import createNavigationItemMutation from "./createNavigationItem.js";

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
  draftData: mockData,
  metadata: "{ \"tagId\": \"t1\" }"
};
const mockNavigationItemResult = {
  _id: "n1",
  metadata: { tagId: "t1" },
  createdAt: "2018-11-16T13:09:38.586Z",
  draftData: mockData
};

test("calls mutations.createNavigationItem and returns the newly created item", async () => {
  const createNavigationItem = jest.fn()
    .mockName("mutations.createNavigationItem")
    .mockReturnValueOnce(mockNavigationItemResult);

  const mockArgs = { input: { navigationItem: mockNavigationItemInput } };
  const { navigationItem } = await createNavigationItemMutation({}, mockArgs, {
    mutations: { createNavigationItem }
  });

  expect(navigationItem).toEqual(mockNavigationItemResult);
  expect(createNavigationItem).toHaveBeenCalled();
});
