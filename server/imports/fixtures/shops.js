import faker from "faker";
import { Shops } from "/lib/collections";

export function getShop() {
  createShopFactory();
  const existingShop = Shops.findOne();
  return existingShop || Factory.create("shop");
}

export function getAddress(options = {}) {
  const defaults = {
    fullName: faker.name.findName(),
    address1: faker.address.streetAddress(),
    address2: faker.address.secondaryAddress(),
    city: faker.address.city(),
    company: faker.company.companyName(),
    phone: faker.phone.phoneNumber(),
    region: faker.address.stateAbbr(),
    postal: faker.address.zipCode(),
    country: faker.address.countryCode(),
    isCommercial: faker.random.boolean(),
    isShippingDefault: faker.random.boolean(),
    isBillingDefault: faker.random.boolean(),
    metafields: []
  };
  return _.defaults(options, defaults);
}


export function createShopFactory() {
  Factory.define("shop", Shops, {
    name: faker.internet.domainName(),
    description: faker.company.catchPhrase(),
    keywords: faker.company.bsAdjective(),
    addressBook: [ getAddress() ],
    domains: ["localhost"],
    emails: [
      {
        address: faker.internet.email(),
        verified: faker.random.boolean()
      }
    ],
    currency: "USD", // could use faker.finance.currencyCode()
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
    baseUOM: "OZ",
    unitsOfMeasure: [{
      uom: "OZ",
      label: "Ounces",
      default: true
    }, {
      uom: "LB",
      label: "Pounds"
    }, {
      uom: "GR",
      label: "Grams"
    }, {
      uom: "KG",
      label: "Kilograms"
    }],
    layout: [{
      layout: "coreLayout",
      workflow: "coreLayout",
      theme: "default",
      enabled: true
    }, {
      layout: "coreLayout",
      workflow: "coreCartWorkflow",
      collection: "Cart",
      theme: "default",
      enabled: true
    }, {
      layout: "coreLayout",
      workflow: "coreOrderWorkflow",
      collection: "Orders",
      theme: "default",
      enabled: true
    }, {
      layout: "coreLayout",
      workflow: "coreOrderShipmentWorkflow",
      collection: "Orders",
      theme: "default",
      enabled: true
    }],
    public: true,
    timezone: "US/Pacific",
    metafields: [],
    defaultRoles: ["guest", "account/profile"],
    createdAt: new Date,
    updatedAt: new Date()
  });
}


export default function () {
  /**
   * Shop Factory
   * @summary define shop Factory
   */
  createShopFactory();
}
