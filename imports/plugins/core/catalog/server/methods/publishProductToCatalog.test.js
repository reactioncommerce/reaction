import publishProductToCatalog from "./publishProductToCatalog";

const mockCollections = {};

const mockProduct = {};

test("expect to fail", async () => {
  const spec = await publishProductToCatalog(mockProduct, mockCollections);
  expect(spec).toBe(true);
});
