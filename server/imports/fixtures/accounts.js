import faker from "faker";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { Accounts } from "/lib/collections";
import { getShop } from "./shops";

/**
 * @method getUser
 * @memberof Fixtures
 * @return {Object} Existing user or Factory user
 */
export function getUser() {
  const existingUser = Meteor.users.findOne();
  return existingUser || Factory.create("user");
}

/**
 * @method getAddress
 * @memberof Fixtures
 * @param {Object} [options={}] Address options, optional
 * @param {String} [options._id] - id of CartItem
 * @param {String} [options.fullName] fullName
 * @param {String} [options.address1] address1
 * @param {String} [options.address2] address2
 * @param {String} [options.city] city
 * @param {String} [options.company] company
 * @param {String} [options.phone] phone
 * @param {String} [options.region] region
 * @param {String} [options.postal] postal
 * @param {String} [options.country] country
 * @param {Boolean} [options.isCommercial] isCommercial
 * @param {Boolean} [options.isShippingDefault] isShippingDefault
 * @param {Boolean} [options.isBillingDefault] isBillingDefault
 * @param {Array} [options.metafields] metafields
 * @return {Object}              Address object
 */
export function getAddress(options = {}) {
  const defaults = {
    fullName: options.fullName || faker.name.findName(),
    address1: options.address1 || faker.address.streetAddress(),
    address2: options.address2 || faker.address.secondaryAddress(),
    city: options.city || faker.address.city(),
    company: faker.company.companyName(),
    phone: faker.phone.phoneNumber(),
    region: options.region || faker.address.stateAbbr(),
    postal: options.postal || faker.address.zipCode(),
    country: options.country || faker.address.countryCode(),
    isCommercial: options.isCommercial || faker.random.boolean(),
    isShippingDefault: options.isShippingDefault || faker.random.boolean(),
    isBillingDefault: options.isBillingDefault || faker.random.boolean(),
    metafields: []
  };
  return _.defaults(options, defaults);
}

/**
 * @name account
 * @memberof Fixtures
 * @summary Factory for Account
 * @example Factory.create("account", { _id: "12345678", shopId });
 * @property {String} shopID - `getShop()._id`
 * @property {String} userId id - `Factory.get("user")`
 * @property {Array} emails `[{
   address: faker.internet.email(),
   verified: faker.random.boolean()
 }]`
 * @property {Boolean} acceptsMarketing - `true`
 * @property {String} state - `"new"`
 * @property {Note} note - `faker.lorem.sentences()`
 * @property {Object} profile - `{
   addressBook: [
     getAddress()
   ]
 }`
 * @property {Array} metafields - '[]'
 * @property {Date} createdAt - `new Date()`
 * @property {Date} updatedAt - `new Date()`
 */
export function createAccountFactory() {
  // there are many places in code which require that an Account's _id be equal
  // to the User's _id (and therefore equal to userId)
  Factory.define("account", Accounts, {
    shopId: getShop()._id,
    userId: getUser()._id,
    emails: [{
      address: faker.internet.email(),
      verified: faker.random.boolean()
    }],
    acceptsMarketing: true,
    state: "new",
    note: faker.lorem.sentences(),
    profile: {
      addressBook: [
        getAddress()
      ]
    },
    metafields: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

export default function () {
  createAccountFactory();
}
