/* eslint camelcase: 0 */
import Shopify from "shopify-api-node";
import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { check, Match } from "meteor/check";
import { Hooks, Logger, Reaction } from "/server/api";
import { Accounts } from "/lib/collections";
import { getApiInfo } from "../api/api";
import { connectorsRoles } from "../../lib/roles";

/**
 * @file Shopify connector import customer method
 *       contains methods and helpers for setting up and removing synchronization between
 *       a Shopify store and a Reaction shop
 * @module connectors-shopify
 */

/**
 * Transforms a Shopify customer into a Reaction customer.
 * @private
 * @method createReactionCustomerFromShopifyCustomer
 * @param  {object} options Options object
 * @param  {object} options.shopifyCustomer the Shopify customer object
 * @param  {string} options.shopId The shopId we're importing for
 * @return {object} An object that fits the `Account` schema
 *
 * @todo consider abstracting private Shopify import helpers into a helpers file
 */
function createReactionCustomerFromShopifyCustomer(options) {
  const { shopifyCustomer, shopId } = options;

  const userId = Random.id();
  const reactionProfile = { currency: Reaction.getPrimaryShopCurrency() };
  // shopify is very forgiving so expect plenty of nulls !!
  const fakePhone = "33888888888";
  const fakeZip = "00000";
  const first_name = shopifyCustomer.first_name || "no_first_name";
  const last_name = shopifyCustomer.last_name || "no_last_name";
  const name = `${first_name} ${last_name}`;

  const reactionCustomer = {
    createdAt: shopifyCustomer.created_at,
    name,
    acceptsMarketing: shopifyCustomer.accepts_marketing,
    note: shopifyCustomer.note,
    metafields: [],
    shopId, // set shopId to active shopId;
    userId,
    shopifyId: shopifyCustomer.id.toString(), // save it here to make sync lookups cheaper
    tags: shopifyCustomer.tags,
    orders_count: shopifyCustomer.orders_count,
    updatedAt: new Date(),
    workflow: {
      status: "new",
      workflow: ["imported"]
    },
    skipRevision: true
  };

  // shopify customer import will fail if we add a null email
  if (shopifyCustomer.email !== null) {
    // we make sure the email from shopify doesn't have typo like commas instead of dots
    // which is a quite common typo
    shopifyCustomer.email = shopifyCustomer.email.replace(/,/g, ".");
    // we remove any character that is not valid from email address.
    // TODO use Reaction validate methods instead...
    shopifyCustomer.email = shopifyCustomer.email.replace(/[^a-zA-Z0-9!#$%&'*+-/=?^_`{|}~@]/g, "");
    try {
      reactionCustomer.emails = [{ address: shopifyCustomer.email }];
    } catch (error) {
      Logger.error("There was a problem importing your customers email from Shopify", error);
      throw new Meteor.Error("There was a problem importing your customers email from Shopify", error);
    }
  }
  // if shopify customer has just registered chances are
  // that's not even activated and there will no default_address field
  // so I'll have to check against the length of addresses instead.
  if (shopifyCustomer.addresses.length > 0) {
    // some addresses are spammy and if address1 is empty
    // high chances are that most fields will be missing
    // so might stop here and forget about this addresses
    if (shopifyCustomer.default_address.address1 !== "") {
      // ok we have a default address, and does not look spammy
      const shopifyCustomerAddress = shopifyCustomer.default_address;
      // Shopify has phone fields with null value
      // let's add a fakePhone so reaction validator will not whine about it
      if (shopifyCustomerAddress.phone === "" || shopifyCustomerAddress.phone === null) {
        shopifyCustomerAddress.phone = fakePhone;
      }
      // no province / state, np I'll stick the city in it
      if (shopifyCustomerAddress.province === "" || shopifyCustomerAddress.province === null) {
        shopifyCustomerAddress.province = shopifyCustomerAddress.city;
      }
      // no postal code... lets put a fakeZip TODO auto zip finder
      if (shopifyCustomerAddress.zip === "" || shopifyCustomerAddress.zip === null) {
        shopifyCustomerAddress.zip = fakeZip;
      }

      const reactionAddress = {
        fullName: name,
        address1: shopifyCustomerAddress.address1,
        address2: shopifyCustomerAddress.address2,
        city: shopifyCustomerAddress.city,
        company: shopifyCustomerAddress.company,
        phone: shopifyCustomerAddress.phone,
        region: shopifyCustomerAddress.province,
        postal: shopifyCustomerAddress.zip,
        country: shopifyCustomerAddress.country,
        isCommercial: false,
        isBillingDefault: shopifyCustomerAddress.default,
        isShippingDefault: shopifyCustomerAddress.default
      };

      reactionProfile.addressBook = [reactionAddress];

      try {
        reactionCustomer.profile = reactionProfile;
      } catch (error) {
        Logger.error("There was a problem importing your customers addresses from Shopify", error);
        throw new Meteor.Error("There was a problem importing your customers addresses from Shopify", error);
      }
    }
  }

  return reactionCustomer;
}

export const methods = {
  /**
   * Imports customers for the active Reaction Shop from Shopify with the API credentials setup for that shop.
   *
   * @async
   * @method connectors/shopify/import/customers
   * @param {object} options An object of options for the shopify API call. Available options here: https://help.shopify.com/api/reference/customer#index
   * @returns {array} An array of the Reaction account _ids that were created.
   */
  async "connectors/shopify/import/customers"(options) {
    check(options, Match.Maybe(Object));
    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const apiCreds = getApiInfo();
    const shopify = new Shopify(apiCreds);
    const shopId = Reaction.getShopId();
    const limit = 250; // Shopify returns a maximum of 250 results per request
    const ids = [];
    const opts = Object.assign({}, {
      published_status: "published",
      limit
    }, { ...options });

    try {
      const customerCount = await shopify.customer.count();
      const numPages = Math.ceil(customerCount / limit);
      const pages = [...Array(numPages).keys()];
      Logger.info(`Shopify Connector is preparing to import ${customerCount} customers`);

      for (const page of pages) {
        Logger.debug(`Importing page ${page + 1} of ${numPages} - each page has ${limit} products`);
        const shopifyCustomers = await shopify.customer.list({ ...opts, page }); // eslint-disable-line no-await-in-loop
        for (const shopifyCustomer of shopifyCustomers) {
          if (!Accounts.findOne({ shopifyId: shopifyCustomer.id }, { fields: { _id: 1 } })) {
            // Setup reaction customer
            const reactionCustomer = createReactionCustomerFromShopifyCustomer({ shopifyCustomer, shopId });

            // Insert customer, save id
            const reactionCustomerId = Accounts.insert(reactionCustomer, { publish: true });
            Hooks.Events.run("afterAccountsInsert", Meteor.userId(), reactionCustomerId);
            ids.push(reactionCustomerId);

            Accounts.update({ _id: reactionCustomerId }, { publish: true });
            Hooks.Events.run("afterAccountsUpdate", Meteor.userId(), {
              accountId: reactionCustomerId,
              updatedFields: ["forceIndex"]
            });
          } else { // customer already exists check
            Logger.info(`Customer ${shopifyCustomer.last_name} ${shopifyCustomer.id} already exists`);
          }
        } // End customer loop
      } // End pages loop
      Logger.info(`Reaction Shopify Connector has finished importing ${ids.length} customers`);

      return ids;
    } catch (error) {
      Logger.error("There was a problem importing your customers from Shopify", error);
      throw new Meteor.Error("There was a problem importing your customers from Shopify", error);
    }
  }
};

Meteor.methods(methods);
