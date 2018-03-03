import faker from "faker";
import _ from "lodash";
import { Factory } from "meteor/dburles:factory";
import { Random } from "meteor/random";
import { Shops } from "/lib/collections";

export function getShop() {
  createShopFactory();
  const existingShop = Shops.findOne();
  return existingShop || Factory.create("shop");
}

export function getShopId() {
  const shop = Shops.find({}).fetch()[0];
  return shop && shop._id;
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

// shop name should be unique for the slug to be unique
const shop = {
  name: () => faker.internet.domainName(),
  description: faker.company.catchPhrase(),
  keywords: faker.company.bsAdjective(),
  addressBook: [getAddress()],
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
  baseUOL: "in",
  unitsOfLength: [{
    uol: "in",
    label: "Inches",
    default: true
  }, {
    uol: "cm",
    label: "Centimeters"
  }, {
    uol: "ft",
    label: "Feet"
  }],
  baseUOM: "oz",
  unitsOfMeasure: [{
    uom: "oz",
    label: "Ounces",
    default: true
  }, {
    uom: "lb",
    label: "Pounds"
  }, {
    uom: "g",
    label: "Grams"
  }, {
    uom: "kg",
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
  workflow: {
    status: "active"
  },
  public: true,
  brandAssets: [
    {
      mediaId: "J8Bhq3uTtdgwZx3rz",
      type: "navbarBrandImage"
    }
  ],
  timezone: "US/Pacific",
  metafields: [],
  // one shop in the marketplace is required as default shop. This is used to control marketplace settings.
  // Not having a primary shop will cause test failures
  shopType: "primary",
  createdAt: new Date(),
  updatedAt: new Date()
};

const activeShop = {
  workflow: {
    status: "active"
  },
  _id: Random.id()
};

export function createActiveShop(options = {}) {
  const existingActiveShop = Shops.findOne({ "workflow.status": "active", ...options });

  // If we found an existingActiveShop, return it
  if (existingActiveShop) {
    return existingActiveShop;
  }
  // Otherwise, we need to create a new shop from the factory

  // Setup the activeShop factory definition
  createActiveShopFactory();

  // Create a new shop from the factory with the provided options
  return Factory.create("activeShop", options);
}

export function createShopFactory() {
  Factory.define("shop", Shops, shop);
}

export function createActiveShopFactory() {
  Factory.define("activeShop", Shops, Object.assign({}, shop, activeShop));
}


export default function () {
  /**
   * Shop Factory
   * @summary define shop Factory
   */
  createShopFactory();
  createActiveShopFactory();
}
