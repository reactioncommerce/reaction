import faker from "faker";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { Accounts } from "/lib/collections";
import { getShop } from "./shops";

/**
 * Factory account
 */

export function getUser() {
  const existingUser = Meteor.users.findOne();
  return existingUser || Factory.create("user");
}

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

export function createAccountFactory() {
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
