import CurrencyDefinitions from "./CurrencyDefinitions.js";

const currencyOptions = [];

for (const currency in CurrencyDefinitions) {
  if ({}.hasOwnProperty.call(CurrencyDefinitions, currency)) {
    const structure = CurrencyDefinitions[currency];
    const label = `${currency} | ${structure.symbol} | ${structure.format}`;

    currencyOptions.push({
      label,
      value: currency
    });
  }
}

export default currencyOptions;
