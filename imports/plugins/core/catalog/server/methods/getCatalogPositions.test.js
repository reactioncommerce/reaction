import getCatalogPositions from "./getCatalogPositions";

const mockProductPositions = {
  tag1: {
    weight: 1,
    updatedAt: new Date("2018-04-17T15:34:28.043Z")
  },
  tag2: {
    weight: 2
  }
};

const mockCatalogPositions = [
  {
    displayWeight: 1,
    isPinned: false,
    position: 1,
    tagId: "tag1",
    updatedAt: new Date("2018-04-17T15:34:28.043Z")
  },
  {
    displayWeight: 2,
    isPinned: false,
    position: 1,
    tagId: "tag2",
    updatedAt: undefined
  }
];

test("expect array of CatalogPosition object when providing a product postions object with mutliple tag positions", async () => {
  const spec = await getCatalogPositions(mockProductPositions);
  const success = mockCatalogPositions;
  expect(spec).toEqual(success);
});
