import methods from "./index.js";

test("percentage method should return correct value", () => {
  expect(methods.percentage(10, 100)).toBe(90);
});

test("flat method should return correct value", () => {
  expect(methods.flat(10)).toBe(10);
});

test("fixed method should return correct value when discountValue <= price", () => {
  expect(methods.fixed(10, 100)).toBe(90);
  expect(methods.fixed(100, 100)).toBe(0);
});

test("fixed method should return 0 when discountValue > price", () => {
  expect(methods.fixed(110, 100)).toBe(0);
});
