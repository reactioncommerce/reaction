/* eslint camelcase: 0 */
import Logger from "@reactioncommerce/logger";
import moment from "moment";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { OrderSearch, AccountSearch, Orders, Accounts } from "/lib/collections";
import { transformations } from "./transformations";

const requiredFields = {};
requiredFields.orders = ["_id", "shopId", "shippingName", "shippingPhone", "billingName", "userEmails",
  "shippingAddress", "billingAddress", "shippingStatus", "billingStatus", "orderTotal", "orderDate"];
requiredFields.accounts = ["_id", "shopId", "emails", "profile"];

/**
 * When using Collection.rawCollection() methods that return a Promise,
 * handle the errors in a catch. However, ignore errors with altering indexes
 * before a collection exists.
 * @param  {Error} error an error object returned from a Promise rejection
 * @return {undefined}   doesn't return anything
 * @private
 */
function handleIndexUpdateFailures(error) {
  // If we get an error from the Mongo driver because something tried to drop a
  // collection before it existed, log it out as debug info.
  // Otherwise, log whatever happened as an error.
  if (error.name === "MongoError" && error.message === "ns not found") {
    Logger.debug(error, "Attempted to set or remove indexes in a Mongo collection that doesn't exist yet");
  } else {
    Logger.error(error);
  }
}

/**
 * @summary buildOrderSearchRecord
 */
function buildOrderSearchRecord(order) {
  Logger.debug(`building order search record for order ${order._id}`);
  const user = Meteor.users.findOne({ _id: order.userId });
  const anonymousUserEmail = order.email;

  const userEmails = [];
  if (user && user.emails.length) {
    for (const email of user.emails) {
      userEmails.push(email.address);
    }
  } else if (anonymousUserEmail) {
    userEmails.push(anonymousUserEmail);
  }
  const orderSearch = {};
  for (const field of requiredFields.orders) {
    if (transformations.orders[field]) {
      orderSearch[field] = transformations.orders[field](order[field]);
    } else {
      orderSearch[field] = order[field];
    }
  }

  // get the billing object for the current shop on the order (and not hardcoded [0])
  const shopBilling = (order.billing && order.billing.find((billing) => billing && billing.shopId === Reaction.getShopId())) || {};

  // get the shipping object for the current shop on the order (and not hardcoded [0])
  const shopShipping = order.shipping.find((shipping) => shipping.shopId === Reaction.getShopId()) || {};

  orderSearch.billingName = shopBilling.address && shopBilling.address.fullName;
  orderSearch.billingPhone = shopBilling.address && shopBilling.address.phone.replace(/\D/g, "");
  orderSearch.shippingName = shopShipping.address && shopShipping.address.fullName;
  if (shopShipping.address && shopShipping.address.phone) {
    orderSearch.shippingPhone = shopShipping.address && shopShipping.address.phone.replace(/\D/g, "");
  }

  orderSearch.billingAddress = {
    address: shopBilling.address && shopBilling.address.address1,
    postal: shopBilling.address && shopBilling.address.postal,
    city: shopBilling.address && shopBilling.address.city,
    region: shopBilling.address && shopBilling.address.region,
    country: shopBilling.address && shopBilling.address.country
  };
  orderSearch.shippingAddress = {
    address: shopShipping.address && shopShipping.address.address1,
    postal: shopShipping.address && shopShipping.address.postal,
    city: shopShipping.address && shopShipping.address.city,
    region: shopShipping.address && shopShipping.address.region,
    country: shopShipping.address && shopShipping.address.country
  };
  orderSearch.userEmails = userEmails;
  orderSearch.orderTotal = shopBilling.invoice && shopBilling.invoice.total;
  orderSearch.orderDate = moment && moment(order.createdAt).format("YYYY/MM/DD");
  orderSearch.billingStatus = shopBilling.paymentMethod && shopBilling.paymentMethod.status;
  orderSearch.billingCard = shopBilling.paymentMethod && shopBilling.paymentMethod.storedCard;
  orderSearch.currentWorkflowStatus = order.workflow.status;
  if (shopShipping.shipped) {
    orderSearch.shippingStatus = "Shipped";
  } else if (shopShipping.packed) {
    orderSearch.shippingStatus = "Packed";
  } else {
    orderSearch.shippingStatus = "New";
  }
  orderSearch.product = {};
  orderSearch.variants = {};
  orderSearch.product.title = order.items.map((item) => item.title);
  orderSearch.variants.title = order.items.map((item) => item.variantTitle);
  orderSearch.variants.optionTitle = order.items.map((item) => item.optionTitle);
  orderSearch._id = order._id;

  OrderSearch.insert(orderSearch);
}

/**
 * @summary buildAccountSearchRecord
 */
function buildAccountSearchRecord(account, updatedFields) {
  Logger.debug(`building account search record for account ${account._id}`);
  check(account, Object);
  check(updatedFields, Array);

  // let's ignore anonymous accounts
  if (account && account.emails && account.emails.length) {
    const accountSearch = {};

    // Not all required fields are used in search
    // We need to filter through fields that are used,
    // and only update the search index if one of those fields were updated
    // forceIndex is included to forceIndexing on startup, or when manually added
    const searchableFields = ["forceIndex", "shopId", "emails", "firstName", "lastName", "phone"];

    const shouldRunIndex = updatedFields && updatedFields.some((field) => searchableFields.includes(field));

    // If updatedFields contains one of the searchableFields, run the indexing
    if (shouldRunIndex) {
      for (const field of requiredFields.accounts) {
        if (transformations.accounts[field]) {
          accountSearch[field] = transformations.accounts[field](account[field]);
        } else {
          accountSearch[field] = account[field];
        }
      }
      AccountSearch.insert(accountSearch);
    }
  }
}

/**
 * @summary buildOrderSearch
 */
export function buildOrderSearch() {
  Orders.find({}).forEach((order) => {
    buildOrderSearchRecord(order);
  });

  const rawOrderSearchCollection = OrderSearch.rawCollection();
  rawOrderSearchCollection.dropIndexes().catch(handleIndexUpdateFailures);
  rawOrderSearchCollection.createIndex({
    shopId: 1, shippingName: 1, billingName: 1, userEmails: 1
  }).catch(handleIndexUpdateFailures);
}

/**
 * @summary buildAccountSearch
 */
export function buildAccountSearch() {
  Accounts.find({}).forEach((account) => {
    // Passing forceIndex will run account search index even if
    // updated fields don't match a searchable field
    buildAccountSearchRecord(account, ["forceIndex"]);
  });

  const rawAccountSearchCollection = AccountSearch.rawCollection();
  rawAccountSearchCollection.dropIndexes().catch(handleIndexUpdateFailures);
  rawAccountSearchCollection.createIndex({ shopId: 1, emails: 1 }).catch(handleIndexUpdateFailures);
}
