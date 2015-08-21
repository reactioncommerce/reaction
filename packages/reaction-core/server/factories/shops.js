Fake.reactionAddress = function() {
  return {
    fullName: Fake.sentence(2),
    address1: Fake.sentence(2),
    address2: Fake.sentence(2),
    city: Fake.word(),
    company: Fake.word(),
    phone: "Phone",
    region: Fake.word(),
    postal: _.random(10000, 100000),
    country: "USA",
    isCommercial: false,
    isShippingDefault: true,
    isBillingDefault: true,
    metafields: []
  };
};

Factory.define('shop', ReactionCore.Collections.Shops, {
  name: Fake.sentence(2),
  description: Fake.paragraph(20),
  keywords: Fake.sentence(20),
  addressBook: [Fake.reactionAddress()],
  domains: ["localhost"],
  emails: [
    {
      'address': 'root@localhost',
      'verified': true
    }
  ],
  currency: "USD",
  currencies: {
    "USD": {
      "format": "%s%v",
      "symbol": "$"
    },
    "EUR": {
      "format": "%v %s",
      "symbol": "€",
      "decimal": ",",
      "thousand": "."
    }
  },
  locale: "en",
  locales: {
    continents: {
      'NA': 'North America'
    },
    countries: {
      'US': {
        "name": "United States",
        "native": "United States",
        "phone": "1",
        "continent": "NA",
        "capital": "Washington D.C.",
        "currency": "USD,USN,USS",
        "languages": "en"
      }
    }
  },
  public: true,
  timezone: "US/Pacific",
  baseUOM: "OZ",
  metafields: [],
  defaultRoles: ["guest", "account/profile"],
  createdAt: new Date(),
  updatedAt: new Date()
});
