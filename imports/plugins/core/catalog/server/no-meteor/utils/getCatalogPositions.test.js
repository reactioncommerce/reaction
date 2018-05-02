import getCatalogPositions from "./getCatalogPositions";

const mockProductPositions = {
  tag1: {
    weight: 1,
    updatedAt: new Date("2018-04-17T15:34:28.043Z")
  },
  tag2: {
    weight: 2
  },
  tag3: {
    weight: 1,
    pinned: true
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
  },
  {
    displayWeight: 1,
    isPinned: true,
    position: 1,
    tagId: "tag3",
    updatedAt: undefined
  }
];

test("expect array of CatalogPosition objects when providing a product postions object with a single tag positions", async () => {
  const spec = await getCatalogPositions({ tag1: { ...mockProductPositions.tag1 } });
  const success = [mockCatalogPositions[0]];
  expect(spec).toEqual(success);
});

test("expect array of CatalogPosition objects when providing a product postions object with mutliple tag positions", async () => {
  const spec = await getCatalogPositions(mockProductPositions);
  const success = mockCatalogPositions;
  expect(spec).toEqual(success);
});
