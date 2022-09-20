import CountryDefinitions from "./CountryDefinitions.js";

const countryOptions = [];

for (const locale in CountryDefinitions) {
  if ({}.hasOwnProperty.call(CountryDefinitions, locale)) {
    const country = CountryDefinitions[locale];
    countryOptions.push({
      label: country.name,
      value: locale
    });
  }
}

countryOptions.sort((itemA, itemB) => {
  if (itemA.label < itemB.label) {
    return -1;
  }
  if (itemA.label > itemB.label) {
    return 1;
  }
  return 0;
});

export default countryOptions;
