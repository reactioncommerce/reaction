import getPriceRange from "./getPriceRange.js";

const mockZeroPrice = [0];
const mockSinglePrice = [5.99];
const mockSamePrices = [2.99, 2.99];
const mockDifferentPrices = [2.99, 15.99];
const mockMoreDifferentPrices = [...mockDifferentPrices, 8.99, 20.99];

// expect price object with zero values
test("expect price object with zero values when provided price values of 0", () => {
  const spec = getPriceRange(mockZeroPrice);
  const success = {
    range: "0.00",
    max: 0,
    min: 0
  };
  expect(spec).toEqual(success);
});

// epxect price object to have same value when only one price
test("expect price object to have same value when only one price", () => {
  const spec = getPriceRange(mockSinglePrice);
  const success = {
    range: "5.99",
    max: 5.99,
    min: 5.99
  };
  expect(spec).toEqual(success);
});

// epxect price object to have same value when provided prices are the same
test("expect price object to have same value when provided prices are the same", () => {
  const spec = getPriceRange(mockSamePrices);
  const success = {
    range: "2.99",
    max: 2.99,
    min: 2.99
  };
  expect(spec).toEqual(success);
});

// expect price object with uniq range, min and max when provided pries are all different
test("expect price object with uniq range, min and max when provided pries are all different", () => {
  const spec = getPriceRange(mockDifferentPrices);
  const success = {
    range: "2.99 - 15.99",
    max: 15.99,
    min: 2.99
  };
  expect(spec).toEqual(success);
});

test("expect price object with uniq range, min and max when provided pries are all different", () => {
  const spec = getPriceRange(mockMoreDifferentPrices);
  const success = {
    range: "2.99 - 20.99",
    max: 20.99,
    min: 2.99
  };
  expect(spec).toEqual(success);
});
