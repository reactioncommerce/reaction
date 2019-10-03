import getVariantPriceRange from "./getVariantPriceRange.js";

const internalCatalogProductId = "999";
const internalVariantIds = ["875", "874", "873"];

const mockVariants = [
  {
    _id: internalVariantIds[0],
    ancestors: [internalCatalogProductId],
    isDeleted: false,
    isVisible: true,
    price: 2.99
  },
  {
    _id: internalVariantIds[1],
    ancestors: [internalCatalogProductId, internalVariantIds[0]],
    isDeleted: false,
    isVisible: true,
    price: 5.99
  },
  {
    _id: internalVariantIds[2],
    ancestors: [internalCatalogProductId, internalVariantIds[0]],
    isDeleted: false,
    isVisible: true,
    price: 3.99
  }
];

// expect topVariant price if no children
test("expect topVariants price string if no child variants", () => {
  const spec = getVariantPriceRange(internalVariantIds[0], mockVariants.slice(0, 1));
  const success = {
    range: "2.99",
    max: 2.99,
    min: 2.99
  };
  expect(spec).toEqual(success);
});

// expect child variant price if only one child variant
test("expect child variant price string if only one child variant", () => {
  const spec = getVariantPriceRange(internalVariantIds[0], mockVariants.slice(0, 2));
  const success = {
    range: "5.99",
    max: 5.99,
    min: 5.99
  };
  expect(spec).toEqual(success);
});

// expect a price rang string of the min price and max price
test("expect price range string if variants have different prices", () => {
  const spec = getVariantPriceRange(internalVariantIds[0], mockVariants);
  const success = {
    range: "3.99 - 5.99",
    max: 5.99,
    min: 3.99
  };
  expect(spec).toEqual(success);
});

// expect variant min price if min and max price are equal
test("expect variant price string if variants have same price", () => {
  mockVariants[2].price = 5.99;
  const spec = getVariantPriceRange(internalVariantIds[0], mockVariants);
  const success = {
    range: "5.99",
    max: 5.99,
    min: 5.99
  };
  expect(spec).toEqual(success);
});
