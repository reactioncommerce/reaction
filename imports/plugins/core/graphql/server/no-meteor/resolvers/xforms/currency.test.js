import { xformLegacyCurrencies, xformCurrencyExchangePricing } from "./currency";

const input = {
  USD: {
    enabled: true,
    format: "%s%v",
    symbol: "$",
    rate: 1
  },
  EUR: {
    enabled: true,
    format: "%v %s",
    symbol: "€",
    decimal: ",",
    thousand: ".",
    rate: 0.812743
  }
};

const expected = [
  {
    _id: "USD",
    code: "USD",
    enabled: true,
    format: "%s%v",
    symbol: "$",
    rate: 1
  },
  {
    _id: "EUR",
    code: "EUR",
    enabled: true,
    format: "%v %s",
    symbol: "€",
    decimal: ",",
    thousand: ".",
    rate: 0.812743
  }
];

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
    }
  }
};

const testContext = {
  queries: {
    shops: {
      shopById() {
        return testShop;
      }
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
  displayPrice: "11,13 € - 17,12 €",
  price: null,
  minPrice: 11.13,
  maxPrice: 17.12,
  currency: { code: "EUR" }
};

const priceInput = {
  displayPrice: "$12.99",
  maxPrice: null,
  minPrice: null,
  price: 12.99,
  currencyCode: "USD"
};

const priceOutput = {
  displayPrice: "11,13 €",
  price: 11.13,
  minPrice: null,
  maxPrice: null,
  currency: { code: "EUR" }
};

test("xformLegacyCurrencies converts legacy currency object to an array", () => {
  expect(xformLegacyCurrencies(input)).toEqual(expected);
});

test("xformCurrencyExchangePricing converts min-max pricing object correctly", async () => {
  expect(await xformCurrencyExchangePricing(minMaxPricingInput, "EUR", testContext)).toEqual(minMaxPricingOutput);
});

test("xformCurrencyExchangePricing converts single price pricing object correctly", async() => {
  expect(await xformCurrencyExchangePricing(priceInput, "EUR", testContext)).toEqual(priceOutput);
});
