import mockContext from "/imports/test-utils/helpers/mockContext";
import navigationTreeByIdQuery from "./navigationTreeById";

const mockNavigationTreeId = "456";
const query = { _id: "456" };
const mockNavigationTree = {
  _id: mockNavigationTreeId,
  language: "en"
};


test("calls NavigationTrees.findOne and returns a navigation tree", async () => {
  mockContext.collections.NavigationTrees.findOne.mockReturnValueOnce(mockNavigationTree);
  const result = await navigationTreeByIdQuery(mockContext, "en", mockNavigationTreeId);
  expect(result).toBe(mockNavigationTree);
  expect(mockContext.collections.NavigationTrees.findOne).toHaveBeenCalledWith(query);
});
