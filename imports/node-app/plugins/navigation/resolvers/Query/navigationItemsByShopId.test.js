import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import navigationItemsByShopIdResolver from "./navigationItemsByShopId.js";

const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

const mockNavigationItems = [
  {
    _id: "n1",
    createdAt: "2018-11-16T15:09:38.586Z",
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
    }
  },
  {
    _id: "n2",
    createdAt: "2018-11-16T13:09:38.586Z",
    metadata: { tagId: "t2" },
    draftData: {
      content: [
        {
          language: "en",
          value: "About"
        }
      ],
      isUrlRelative: true,
      shouldOpenInNewWindow: false,
      url: "/about",
      classNames: "about-link"
    }
  }
];

const mockNavigationItemsQuery = getFakeMongoCursor("NavigationItems", mockNavigationItems);

test("calls queries.navigationItemsByShopId and returns a partial connection", async () => {
  const navigationItemsByShopId = jest.fn()
    .mockName("queries.navigationItemsByShopId")
    .mockReturnValueOnce(Promise.resolve(mockNavigationItemsQuery));

  const result = await navigationItemsByShopIdResolver({}, { shopId: opaqueShopId }, {
    queries: { navigationItemsByShopId }
  }, { fieldNodes: [] });

  expect(result).toEqual({
    nodes: mockNavigationItems,
    pageInfo: {
      endCursor: "n2",
      startCursor: "n1"
    },
    totalCount: null
  });

  expect(navigationItemsByShopId).toHaveBeenCalled();
  expect(navigationItemsByShopId.mock.calls[0][1]).toEqual("123");
});
