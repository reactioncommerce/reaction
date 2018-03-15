import _ from "lodash";
import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import * as Schemas from "./schemas";
import { cartOrderTransform } from "./transform/cartOrder";

/**
 * @name mediaRecordsIndex
 * @private
 * @param {RawMongoCollection} rawMedia
 *
 * Sets up necessary indexes on the Media FileCollection
 */
async function mediaRecordsIndex(rawMedia) {
  try {
    await rawMedia.createIndex({ "metadata.productId": 1 }, { background: true });
    await rawMedia.createIndex({ "metadata.variantId": 1 }, { background: true });
    await rawMedia.createIndex({ "metadata.priority": 1 }, { background: true });

    // These queries are used by the workers in file-collections package
    await rawMedia.createIndex({ "original.remoteURL": 1 }, { background: true });
    await rawMedia.createIndex({ "original.tempStoreId": 1 }, { background: true });
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
  }
}

/**
 *
 * Reaction Core Collections
 * @ignore
 */

/**
 * Accounts Collection
 * @ignore
 */
export const Accounts = new Mongo.Collection("Accounts");

Accounts.attachSchema(Schemas.Accounts);


/**
 * AnalyticsEvents Collection
 * Store the Analytics Events in a Collection
 * @ignore
 */
export const AnalyticsEvents = new Mongo.Collection("AnalyticsEvents");

AnalyticsEvents.attachSchema(Schemas.AnalyticsEvents);


/**
 * Assets Collection
 * Store file asset paths or contents in a Collection
 * @ignore
 */
export const Assets = new Mongo.Collection("Assets");

Assets.attachSchema(Schemas.Assets);


/**
 * Cart Collection
 * @ignore
 */
export const Cart = new Mongo.Collection("Cart", {
  transform(cart) {
    const newInstance = Object.create(cartOrderTransform);
    return _.extend(newInstance, cart);
  }
});

Cart.attachSchema(Schemas.Cart);


/**
 * Emails Collection
 * @ignore
 */
export const Emails = new Mongo.Collection("Emails");

Emails.attachSchema(Schemas.Emails);


/**
 * Inventory Collection
 * @ignore
 */
export const Inventory = new Mongo.Collection("Inventory");

Inventory.attachSchema(Schemas.Inventory);


/**
 * Orders Collection
 * @ignore
 */
export const Orders = new Mongo.Collection("Orders", {
  transform(order) {
    const newInstance = Object.create(cartOrderTransform);
    return _.extend(newInstance, order);
  }
});

Orders.attachSchema(Schemas.OrderDocument);

/**
 * Packages Collection
 * @ignore
 */
export const Packages = new Mongo.Collection("Packages");

Packages.attachSchema(Schemas.PackageConfig);

/**
 * Catalog Collection
 * @todo: Attach a schema to the Catalog collection
 * @ignore
 */
export const Catalog = new Mongo.Collection("Catalog");

/**
 * Products Collection
 * @ignore
 */
export const Products = new Mongo.Collection("Products");

Products.attachSchema(Schemas.Product, { selector: { type: "simple" } });
Products.attachSchema(Schemas.ProductVariant, { selector: { type: "variant" } });

/**
 * Revisions Collection
 * @ignore
 */
export const Revisions = new Mongo.Collection("Revisions");

Revisions.attachSchema(Schemas.Revisions);

/**
 * Shipping Collection
 * @ignore
 */
export const Shipping = new Mongo.Collection("Shipping");

Shipping.attachSchema(Schemas.Shipping);

/**
* Shops Collection
* @ignore
*/
export const Shops = new Mongo.Collection("Shops");

Shops.attachSchema(Schemas.Shop);

/**
 * Groups Collection
 * @ignore
 */
export const Groups = new Mongo.Collection("Groups");

Groups.attachSchema(Schemas.Groups);

/**
 * SellerShops Collection (client-only)
 * @ignore
 */
if (Meteor.isClient) {
  export const SellerShops = new Mongo.Collection("SellerShops");

  SellerShops.attachSchema(Schemas.Shop);
}

/**
 * Tags Collection
 * @ignore
 */
export const Tags = new Mongo.Collection("Tags");

Tags.attachSchema(Schemas.Tag);

/**
 * Templates Collection
 * @ignore
 */
export const Templates = new Mongo.Collection("Templates");

Templates.attachSchema(Schemas.Templates, { selector: { type: "template" } });
Templates.attachSchema(Schemas.ReactLayout, { selector: { type: "react" } });

/**
 * Themes Collection
 * @ignore
 */
export const Themes = new Mongo.Collection("Themes");

Themes.attachSchema(Schemas.Themes);

/**
 * Translations Collection
 * @ignore
 */
export const Translations = new Mongo.Collection("Translations");

Translations.attachSchema(Schemas.Translation);

/**
 * Notifications Collection
 * @ignore
 */
export const Notifications = new Mongo.Collection("Notifications");

Notifications.attachSchema(Schemas.Notification);


/**
 * Sms Collection
 * @ignore
 */
export const Sms = new Mongo.Collection("Sms");

Sms.attachSchema(Schemas.Sms);


/**
 * Logs Collection
 * @ignore
 */
export const Logs = new Mongo.Collection("Logs");

Logs.attachSchema(Schemas.Logs);

/**
 * MediaRecords Collection
 * @ignore
 */
export const MediaRecords = new Mongo.Collection("cfs.Media.filerecord");

// Index on the props we search on
if (Meteor.isServer) {
  mediaRecordsIndex(MediaRecords.rawCollection());
}

// Might want to do this at some point.
// MediaRecords.attachSchema();
