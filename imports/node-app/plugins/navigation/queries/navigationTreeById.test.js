import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import navigationTreeByIdQuery from "./navigationTreeById.js";

const mockNavigationTreeId = "456";
const query = { _id: "456" };
const mockNavigationTree = {
  _id: mockNavigationTreeId,
  language: "en"
};

mockContext.queries.primaryShopId = jest.fn().mockName("primaryShopId").mockImplementation(() => "SHOP_ID");

test("calls NavigationTrees.findOne and returns a navigation tree", async () => {
  mockContext.collections.NavigationTrees.findOne.mockReturnValueOnce(mockNavigationTree);
  const result = await navigationTreeByIdQuery(mockContext, {
    language: "en",
    navigationTreeId: mockNavigationTreeId
  });
  expect(result).toBe(mockNavigationTree);
  expect(mockContext.collections.NavigationTrees.findOne).toHaveBeenCalledWith(query);
});
