Factory.define("shop", ReactionCore.Collections.Shops, {
  name: faker.company.companyName(),
  description: faker.company.catchPhrase(),
  keywords: faker.company.bsAdjective(),
  addressBook: [faker.reaction.address() ],
  domains: ["localhost"],
  emails: [
    {
      address: faker.internet.email(),
      verified: faker.random.boolean()
    }
  ],
  currency: "USD",// faker.finance.currencyCode()
  currencies: {
    USD: {
      format: "%s%v",
      symbol: "$"
    },
    EUR: {
      format: "%v %s",
      symbol: "€",
      decimal: ",",
      thousand: "."
    }
  },
  locale: "en",
  locales: {
    continents: {
      NA: "North America"
    },
    countries: {
      US: {
        name: "United States",
        native: "United States",
        phone: "1",
        continent: "NA",
        capital: "Washington D.C.",
        currency: "USD,USN,USS",
        languages: "en"
      }
    }
  },
  public: true,
  timezone: "US/Pacific",
  baseUOM: "OZ",
  metafields: [],
  defaultRoles: ["guest", "account/profile"],
  createdAt: new Date,
  updatedAt: new Date()
});
