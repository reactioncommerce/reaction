import faker from "faker";
import _ from "lodash";
import Random from "@reactioncommerce/random";
import { Factory } from "meteor/dburles:factory";
import { Shops } from "/lib/collections";

/**
 * @method getShop
 * @memberof Fixtures
 * @summary Get an existing shop or create a shop factory
 * @return {Object} Shop
 */
export function getShop() {
  createShopFactory();
  const existingShop = Shops.findOne();
  return existingShop || Factory.create("shop");
}

/**
 * @method getShopId
 * @memberof Fixtures
 * @summary Get the first shop found and return the shop id
 * @return {String} Shop ID
 */
export function getShopId() {
  const shop = Shops.find({}).fetch()[0];
  return shop && shop._id;
}

/**
 * @method getAddress
 * @memberof Fixtures
 * @summary Get an address, supplying options (optional)
 * @param {Object} [options={}] Address options, optional
 * @param {String} [options.fullName] fullName - `faker.name.findName()`
 * @param {String} [options.address1] address1 - `faker.address.streetAddress()`
 * @param {String} [options.address2] address2 - `faker.address.secondaryAddress()`
 * @param {String} [options.city] city - `faker.address.city()`
 * @param {String} [options.company] company - `faker.company.companyName()`
 * @param {String} [options.phone] phone - `faker.phone.phoneNumber()`
 * @param {String} [options.region] region - `faker.address.stateAbbr()`
 * @param {String} [options.postal] postal - `faker.address.zipCode()`
 * @param {String} [options.country] country - `faker.address.countryCode()`
 * @param {String} [options.isCommercial] isCommercial - `faker.random.boolean()`
 * @param {Boolean} [options.isShippingDefault] isShippingDefault - `faker.random.boolean()`
 * @param {Boolean} [options.isBillingDefault] isBillingDefault - `faker.random.boolean()`
 * @param {Array} [options.metafields] metafields - `[]`
 * @return {Object} Address object
 */
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
  defaultParcelSize: {
    weight: () => faker.random.number(),
    length: () => faker.random.number(),
    width: () => faker.random.number(),
    height: () => faker.random.number()
  },
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
    status: "new"
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

/**
 * @method createActiveShop
 * @memberof Fixtures
 * @summary Find and return an existing shop from option parameters, or create an active shop factory
 * @param  {Object} [options={}] Any shop properties
 * @return {Object}              Shop, with active status
 */
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

/**
 * @method createShopFactory
 * @memberof Fixtures
 * @summary Create Shop factory. Shop name should be unique for the slug to be unique.
 * @property {String} name - `faker.internet.domainName()`
 * @property {String} description - `faker.company.catchPhrase()`
 * @property {String} keywords - `faker.company.bsAdjective()`
 * @property {Array} addressBook - `[getAddress()]`
 * @property {Array} domains - `["localhost"]`
 * @property {Array} emails - `[]`
 * @property {String} emails.address - `faker.internet.email()`
 * @property {Boolean} emails.verified - `faker.random.boolean()`
 * @property {String} currency - `"USD"` - Could use faker.finance.currencyCode()
 * @property {Object} currencies - `{}`
 * @property {Object} currencies.USD - `{}`
 * @property {String} currencies.USD.format - `"%s%v"`
 * @property {String} currencies.USD.symbol - `"$"`
 * @property {Object} currencies.EUR - `{}`
 * @property {String} currencies.EUR.format - `"%v %s"`
 * @property {String} currencies.EUR.symbol - `"€"`
 * @property {String} currencies.EUR.decimal - `","`
 * @property {String} currencies.EUR.thousand - `"."`
 * @property {String} locale - `"en"`
 * @property {Object} locales - `{}`
 * @property {Object} locales.continents - `{}`
 * @property {String} locales.continents.NA - `"North America"`
 * @property {Object} locales.countries - `{}`
 * @property {Object} locales.countries.US - `{}`
 * @property {String} locales.countries.name - `"United States"`
 * @property {String} locales.countries.native - `"United States"`
 * @property {String} locales.countries.phone - `"1"`
 * @property {String} locales.countries.continent - `"NA"`
 * @property {String} locales.countries.capital - `"Washington D.C."`
 * @property {String} locales.countries.currency - `"USD,USN,USS"`
 * @property {String} locales.countries.languages - `"en"`
 * @property {String} baseUOL - `"in"`
 * @property {Array} unitsOfLength - `[{}]`
 * @property {String} unitsOfLength.uol - `"in"`
 * @property {String} unitsOfLength.label - `"Inches"`
 * @property {String} unitsOfLength.default - `true`
 * @property {String} unitsOfLength.uol - `"cm"`
 * @property {String} unitsOfLength.label - `"Centimeters"`
 * @property {String} unitsOfLength.uol - `"ft"`
 * @property {String} unitsOfLength.label - `"Feet"`
 * @property {String} baseUOM - `"oz"`
 * @property {Array} unitsOfMeasure - `[{}]`
 * @property {String} unitsOfMeasure.uom - `"oz"`
 * @property {String} unitsOfMeasure.label - `"Ounces"`
 * @property {String} unitsOfMeasure.default - `true`
 * @property {String} unitsOfMeasure.uom - `"lb"`
 * @property {String} unitsOfMeasure.label - `"Pounds"`
 * @property {String} unitsOfMeasure.uom - `"g"`
 * @property {String} unitsOfMeasure.label - `"Grams"`
 * @property {String} unitsOfMeasure.uom - `"kg"`
 * @property {String} unitsOfMeasure.label - `"Kilograms"`
 * @property {Array} layout - `[{}]`
 * @property {String} layout - `"coreLayout"`
 * @property {String} workflow - `"coreLayout"`
 * @property {String} theme - `"default"`
 * @property {Boolean} enabled - `true`
 * @property {String} layout - `"coreLayout"`
 * @property {String} workflow - `"coreCartWorkflow"`
 * @property {String} collection - `"Cart"`
 * @property {String} theme - `"default"`
 * @property {Boolean} enabled - `true`
 * @property {String} layout - `"coreLayout"`
 * @property {String} workflow - `"coreOrderWorkflow"`
 * @property {String} collection - `"Orders"`
 * @property {String} theme - `"default"`
 * @property {Boolean} enabled - `true`
 * @property {String} layout - `"coreLayout"`
 * @property {String} workflow - `"coreOrderShipmentWorkflow"`
 * @property {String} collection - `"Orders"`
 * @property {String} theme - `"default"`
 * @property {Boolean} enabled - `true`
 * @property {Object} workflow - `{}`
 * @property {String} workflow.status - `"active"`
 * @property {Boolean} public - `true`
 * @property {Array} brandAssets - `[]`
 * @property {String} mediaId - `"J8Bhq3uTtdgwZx3rz"`
 * @property {String} type - `"navbarBrandImage"`
 * @property {String} timezone - `"US/Pacific"`
 * @property {Array} metafields - `[]`
 * @property {String} shopType - `"primary"` - Not having a primary shop will cause test failures. one shop in the marketplace is required as default shop. This is used to control marketplace settings.
 * @property {Date} createdAt - `new Date()`
 * @property {Date} updatedAt - `new Date()`
 * @return {Object} Shop with status `"active"`
 */
export function createShopFactory() {
  Factory.define("shop", Shops, shop);
}

/**
 * @name createActiveShopFactory
 * @memberof Fixtures
 * @summary Returns an active shop factory
 * @property {Object} workflow
 * @property {String} status - `"active"`
 * @property {String} id - `Random.id()`
 * @return {Object} Shop with status `"active"`
 */
export function createActiveShopFactory() {
  Factory.define("activeShop", Shops, Object.assign({}, shop, activeShop));
}

export default function () {
  createShopFactory();
  createActiveShopFactory();
}
