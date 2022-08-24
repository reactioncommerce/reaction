import ProductPricingInfo from "./ProductPricingInfo.js";

test("displayPrice: catalog plugin mongo mode", () => {
  expect(ProductPricingInfo.displayPrice({ displayPrice: "$Unit test 1" })).toEqual("$Unit test 1");
});

test("displayPrice: catalog publisher resolver mode", () => {
  const displayPrice = ProductPricingInfo.displayPrice({ minPrice: 1.01, maxPrice: 2.02, currencyCode: "USD" });
  expect(displayPrice).toEqual("$1.01 - $2.02");
});
