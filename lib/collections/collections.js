import { Mongo } from "meteor/mongo";
import * as Schemas from "./schemas";
import { cartTransform } from "./transform/cart";
import { orderTransform } from "./transform/order";

/**
*
* Reaction Core Collections
*
*/

/**
 * Accounts Collection
 */
export const Accounts = new Mongo.Collection("Accounts");

Accounts.attachSchema(Schemas.Accounts);


/*
 *  AnalyticsEvents Collection
 *  Store the Analytics Events in a Collection
 */
export const AnalyticsEvents = new Mongo.Collection("AnalyticsEvents");

AnalyticsEvents.attachSchema(Schemas.AnalyticsEvents);


/**
 *  Assets Collection
 *  Store file asset paths or contents in a Collection
 */
export const Assets = new Mongo.Collection("Assets");

Assets.attachSchema(Schemas.Assets);


/**
* Cart Collection
*/
export const Cart = new Mongo.Collection("Cart", {
  transform(cart) {
    const newInstance = Object.create(cartTransform);
    return _.extend(newInstance, cart);
  }
});

Cart.attachSchema(Schemas.Cart);


/**
* Emails Collection
*/
export const Emails = new Mongo.Collection("Emails");

Emails.attachSchema(Schemas.Emails);


/**
* Inventory Collection
*/
export const Inventory = new Mongo.Collection("Inventory");

Inventory.attachSchema(Schemas.Inventory);


/**
* Orders Collection
*/
export const Orders = new Mongo.Collection("Orders", {
  transform(order) {
    const newInstance = Object.create(orderTransform);
    return _.extend(newInstance, order);
  }
});

Orders.attachSchema([
  Schemas.Cart,
  Schemas.Order,
  Schemas.OrderItem
]);


/**
* Packages Collection
*/
export const Packages = new Mongo.Collection("Packages");

Packages.attachSchema(Schemas.PackageConfig);


/**
* Products Collection
*/
export const Products = new Mongo.Collection("Products");

Products.attachSchema(Schemas.Product, { selector: { type: "simple" } });
Products.attachSchema(Schemas.ProductVariant, { selector: { type: "variant" } });

/**
* Revisions Collection
*/
export const Revisions = new Mongo.Collection("Revisions");

Revisions.attachSchema(Schemas.Revisions);

/**
* Shipping Collection
*/
export const Shipping = new Mongo.Collection("Shipping");

Shipping.attachSchema(Schemas.Shipping);


/**
* Shops Collection
*/
export const Shops = new Mongo.Collection("Shops");

Shops.attachSchema(Schemas.Shop);


/**
* Tags Collection
*/
export const Tags = new Mongo.Collection("Tags");

Tags.attachSchema(Schemas.Tag);


/**
* Templates Collection
*/
export const Templates = new Mongo.Collection("Templates");

Templates.attachSchema(Schemas.Templates, { selector: { type: "template" } });
Templates.attachSchema(Schemas.ReactLayout, { selector: { type: "react" } });

/**
* Themes Collection
*/
export const Themes = new Mongo.Collection("Themes");

Themes.attachSchema(Schemas.Themes);


/**
* Translations Collection
*/
export const Translations = new Mongo.Collection("Translations");

Translations.attachSchema(Schemas.Translation);

/**
 * Notifications Collection
 */
export const Notifications = new Mongo.Collection("Notifications");

Notifications.attachSchema(Schemas.Notification);


/**
 * Sms Collection
 */
export const Sms = new Mongo.Collection("Sms");

Sms.attachSchema(Schemas.Sms);


/**
 * Logs Collection
 */
export const Logs = new Mongo.Collection("Logs");

Logs.attachSchema(Schemas.Logs);
