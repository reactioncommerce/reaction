import { xformLegacyCurrencies } from "./currency";

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
  },
  EUR_NO_RATE: {
    enabled: true,
    format: "%v %s",
    symbol: "€",
    decimal: ",",
    thousand: "."
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
  },
  {
    _id: "EUR_NO_RATE",
    code: "EUR_NO_RATE",
    enabled: true,
    format: "%v %s",
    symbol: "€",
    decimal: ",",
    thousand: "."
  }
];

test("xformLegacyCurrencies converts legacy currency object to an array", () => {
  expect(xformLegacyCurrencies(input)).toEqual(expected);
});
