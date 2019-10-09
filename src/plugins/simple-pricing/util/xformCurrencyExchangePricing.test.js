import xformCurrencyExchangePricing from "./xformCurrencyExchangePricing.js";

const testShop = {
  currency: "USD",
  currencies: {
    EUR: {
      enabled: true,
      format: "%v %s",
      symbol: "€",
      decimal: ",",
      thousand: ".",
      rate: 0.856467
    },
    EUR_NO_RATE: {
      enabled: true,
      format: "%v %s",
      symbol: "€",
      decimal: ",",
      thousand: "."
    }
  }
};

const testContext = {
  queries: {
    primaryShop() {
      return testShop;
    }
  }
};

const minMaxPricingInput = {
  displayPrice: "$12.99 - $19.99",
  maxPrice: 19.99,
  minPrice: 12.99,
  price: null,
  currencyCode: "USD"
};

const minMaxPricingOutput = {
  compareAtPrice: null,
  displayPrice: "11,13 € - 17,12 €",
  price: null,
  minPrice: 11.13,
  maxPrice: 17.12,
  currency: { code: "EUR" }
};

test("xformCurrencyExchangePricing converts min-max pricing object correctly", async () => {
  expect(await xformCurrencyExchangePricing(minMaxPricingInput, "EUR", testContext)).toEqual(minMaxPricingOutput);
});

test("xformCurrencyExchangePricing converts min-max pricing object correctly", async () => {
  expect(await xformCurrencyExchangePricing(minMaxPricingInput, "EUR_NO_RATE", testContext)).toBe(null);
});
