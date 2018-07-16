import mockContext from "/imports/test-utils/helpers/mockContext";
import reconcileCarts from "./reconcileCarts";

test("expect to return a Promise that resolves to TODO", async () => {
  const result = await reconcileCarts(mockContext);
  expect(result).toEqual(null);
});
