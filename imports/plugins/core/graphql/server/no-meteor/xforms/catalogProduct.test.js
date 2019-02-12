import { xformProductMedia } from "./catalogProduct";

const ROOT_URL = "https://example.com";
const context = {
  getAbsoluteUrl: (path) => `${ROOT_URL}${path}`
};

test("catalogProduct works in base case", () => {
  const expected = {
    priority: "unit-test-priority",
    toGrid: "unit-test-to-grid",
    productId: "unit-test-product-id",
    variantId: "unit-test-variant-id",
    URLs: {
      small: `${ROOT_URL}/small.jpg`,
      medium: `${ROOT_URL}/medium.jpg`,
      large: `${ROOT_URL}/large.jpg`,
      original: `${ROOT_URL}/original.jpg`,
      thumbnail: `${ROOT_URL}/thumbnail.jpg`
    }
  };
  const result = xformProductMedia(
    {
      priority: "unit-test-priority",
      toGrid: "unit-test-to-grid",
      productId: "unit-test-product-id",
      variantId: "unit-test-variant-id",
      URLs: {
        small: "/small.jpg",
        medium: "/medium.jpg",
        large: "/large.jpg",
        original: "/original.jpg",
        thumbnail: "/thumbnail.jpg"
      }
    },
    context
  );
  expect(result).toMatchObject(expected);
});

test("catalogProduct works in null case", () => {
  const result = xformProductMedia(null, context);
  expect(result).toBeNull();
});

test("catalogProduct works in {URLs: null} case", () => {
  const result = xformProductMedia({ URLs: null }, context);
  expect(result).toBeNull();
});
