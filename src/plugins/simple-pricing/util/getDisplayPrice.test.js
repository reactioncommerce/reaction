import getDisplayPrice from "./getDisplayPrice.js";

const mockUSDCurrencyInfo = {
  enabled: true,
  format: "%s%v",
  symbol: "$",
  rate: 1
};
const minUSDPrice = 10;
const maxUSDPrice = 19.99;
const expectedUSDDisplayPrice = "$10.00 - $19.99";

const mockRUBCurrencyInfo = {
  enabled: true,
  format: "%v %s",
  symbol: "руб.",
  decimal: ",",
  thousand: " ",
  scale: 0,
  where: "right",
  rate: 68.017871
};
const minRUBPrice = 680.18;
const maxRUBPrice = 1359.68;
const expectedRUBDisplayPrice = "680,18 - 1 359,68 руб.";

test("getDisplayPrice correctly formats USD price range", () => {
  expect(getDisplayPrice(minUSDPrice, maxUSDPrice, mockUSDCurrencyInfo)).toBe(expectedUSDDisplayPrice);
});

test("getDisplayPrice correctly formats RUB price range", () => {
  expect(getDisplayPrice(minRUBPrice, maxRUBPrice, mockRUBCurrencyInfo)).toBe(expectedRUBDisplayPrice);
});
