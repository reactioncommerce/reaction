import tagsForCatalogProducts from "./tagsForCatalogProducts.js";
import mockCollection from "./tests/mockCollection.js";

const Tags = mockCollection("Tags");

test("tagsForCatalogProducts returns correct tag list", async () => {
  Tags.toArray.mockReturnValueOnce([
    {
      _id: "1",
      name: "ONE"
    },
    {
      _id: "2",
      name: "TWO"
    },
    {
      _id: "3",
      name: "THREE"
    }
  ]);

  const catalogProducts = [
    {
      product: {
        productId: "1",
        tagIds: ["1", "2"]
      }
    },
    {
      product: {
        productId: "2",
        tagIds: ["3"]
      }
    }
  ];

  const result = await tagsForCatalogProducts(Tags, catalogProducts);

  expect(result).toEqual([
    {
      productId: "1",
      tags: ["ONE", "TWO"]
    },
    {
      productId: "2",
      tags: ["THREE"]
    }
  ]);
});

test("tagsForCatalogProducts returns empty array if there are no CatalogProducts", async () => {
  const result = await tagsForCatalogProducts(Tags, []);
  expect(result).toEqual([]);
});
