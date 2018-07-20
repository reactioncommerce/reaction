import mockContext from "/imports/test-utils/helpers/mockContext";
import getCatalogVariantMedia from "./getCatalogVariantMedia";

const mockCollections = { ...mockContext.collections };
const mockMediaUrl = jest
  .fn()
  .mockName("fileRecord.url")
  .mockImplementation(({ store }) => `${store}/path/to/image.jpg`);
const mockProductId = "999";
const mockMediaArray = [
  {
    metadata: {
      toGrid: 1,
      priority: 2,
      productId: "444",
      variantId: "245"
    },
    url: mockMediaUrl
  },
  {
    metadata: {
      toGrid: 1,
      priority: 1,
      productId: "999",
      variantId: "345"
    },
    url: mockMediaUrl
  }
];
const mockCatalogProductMediaArray = [
  {
    priority: 1,
    toGrid: 1,
    productId: "999",
    variantId: "345",
    URLs: {
      large: "large/path/to/image.jpg",
      medium: "medium/path/to/image.jpg",
      original: "image/path/to/image.jpg",
      small: "small/path/to/image.jpg",
      thumbnail: "thumbnail/path/to/image.jpg"
    }
  },
  {
    priority: 2,
    toGrid: 1,
    productId: "444",
    variantId: "245",
    URLs: {
      large: "large/path/to/image.jpg",
      medium: "medium/path/to/image.jpg",
      original: "image/path/to/image.jpg",
      small: "small/path/to/image.jpg",
      thumbnail: "thumbnail/path/to/image.jpg"
    }
  }
];

test("expect to pass", async () => {
  mockCollections.Media.find.mockReturnValueOnce(Promise.resolve(mockMediaArray));
  const spec = await getCatalogVariantMedia(mockProductId, mockCollections);
  expect(spec).toEqual(mockCatalogProductMediaArray);
});
