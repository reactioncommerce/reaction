import _ from "lodash";
import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import * as Schemas from "./schemas";
import { cartOrderTransform } from "./transform/cartOrder";

/**
 * Meteor Mongo.Collection instance
 * @typedef MongoCollection
 * @type {Object}
 */

/**
 * Meteor Mongo.Collection instances that are available in both Node and browser code
 * @namespace Collections
 */

/**
 * Meteor Mongo.Collection instances that are available only in Node code
 * @namespace Collections/ServerOnly
 */

/**
 * Meteor Mongo.Collection instances that are available only in browser code
 * @namespace Collections/ClientOnly
 */

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
 * @name Accounts
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Accounts = new Mongo.Collection("Accounts");

Accounts.attachSchema(Schemas.Accounts);


/**
 * @name Assets
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Assets = new Mongo.Collection("Assets");

Assets.attachSchema(Schemas.Assets);


/**
 * @name Cart
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Cart = new Mongo.Collection("Cart", {
  transform(cart) {
    const newInstance = Object.create(cartOrderTransform);
    return _.extend(newInstance, cart);
  }
});

Cart.attachSchema(Schemas.Cart);


/**
 * @name Emails
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Emails = new Mongo.Collection("Emails");

Emails.attachSchema(Schemas.Emails);


/**
 * @name Inventory
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Inventory = new Mongo.Collection("Inventory");

Inventory.attachSchema(Schemas.Inventory);


/**
 * @name Orders
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Orders = new Mongo.Collection("Orders", {
  transform(order) {
    const newInstance = Object.create(cartOrderTransform);
    return _.extend(newInstance, order);
  }
});

Orders.attachSchema(Schemas.Order);

/**
 * @name Packages
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Packages = new Mongo.Collection("Packages");

Packages.attachSchema(Schemas.PackageConfig);

/**
 * @name Catalog
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Catalog = new Mongo.Collection("Catalog");

/**
 * @name Products
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Products = new Mongo.Collection("Products");

Products.attachSchema(Schemas.Product, { selector: { type: "simple" } });
Products.attachSchema(Schemas.ProductVariant, { selector: { type: "variant" } });

/**
 * @name Shipping
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Shipping = new Mongo.Collection("Shipping");

Shipping.attachSchema(Schemas.Shipping);

/**
 * @name Shops
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Shops = new Mongo.Collection("Shops");

Shops.attachSchema(Schemas.Shop);

/**
 * @name Groups
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Groups = new Mongo.Collection("Groups");

Groups.attachSchema(Schemas.Groups);

/**
 * @name SellerShops
 * @memberof Collections/ClientOnly
 * @type {MongoCollection}
 */
let sellerShops;
if (Meteor.isClient) {
  sellerShops = new Mongo.Collection("SellerShops");

  sellerShops.attachSchema(Schemas.Shop);
}
export const SellerShops = sellerShops;

/**
 * @name Tags
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Tags = new Mongo.Collection("Tags");

Tags.attachSchema(Schemas.Tag);

/**
 * @name Templates
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Templates = new Mongo.Collection("Templates");

Templates.attachSchema(Schemas.Templates, { selector: { type: "template" } });
Templates.attachSchema(Schemas.ReactLayout, { selector: { type: "react" } });


/**
 * @name Translations
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Translations = new Mongo.Collection("Translations");

Translations.attachSchema(Schemas.Translation);

/**
 * @name Notifications
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Notifications = new Mongo.Collection("Notifications");

Notifications.attachSchema(Schemas.Notification);


/**
 * @name MediaRecords
 * @memberof Collections
 * @type {MongoCollection}
 */
export const MediaRecords = new Mongo.Collection("cfs.Media.filerecord");

// Index on the props we search on
if (Meteor.isServer) {
  mediaRecordsIndex(MediaRecords.rawCollection());
}

// Might want to do this at some point.
// MediaRecords.attachSchema();

/**
 * @name NavigationItems
 * @memberof Collections
 * @type {MongoCollection}
 */
export const NavigationItems = new Mongo.Collection("NavigationItems");
