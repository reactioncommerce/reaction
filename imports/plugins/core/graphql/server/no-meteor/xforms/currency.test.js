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
    shopById() {
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
  compareAtPrice: {
    amount: 0,
    currencyCode: "EUR"
  },
  displayPrice: "11,13 € - 17,12 €",
  price: null,
  minPrice: 11.13,
  maxPrice: 17.12,
  currency: { code: "EUR" }
};

test("xformLegacyCurrencies converts legacy currency object to an array", () => {
  expect(xformLegacyCurrencies(input)).toEqual(expected);
});

test("xformCurrencyExchangePricing converts min-max pricing object correctly", async () => {
  expect(await xformCurrencyExchangePricing(minMaxPricingInput, "EUR", testContext)).toEqual(minMaxPricingOutput);
});
