import mockContext from "/imports/test-utils/helpers/mockContext";
import removeTagsFromProducts from "./removeTagsFromProducts";

const mockInput = {
  input: {
    productIds: ["BCTMZ6HTxFSppJESk"],
    tagIds: ["cmVhY3Rpb24vdGFnOmNzZUNCU1NySjN0OEhRU05Q"]
  }
};

const expectedResults = {
  foundCount: 1,
  notFoundCount: 0,
  updatedCount: 1,
  writeErrors: []
};

test("Testing removeTagsFromProducts, returns info on the results of the bulk write", async () => {
  const { input } = mockInput;
  const results = await removeTagsFromProducts(mockContext, input);

  expect(mockContext.collections.Products.bulkWrite).toHaveBeenCalled();
  expect(results).toEqual(expectedResults);
});
