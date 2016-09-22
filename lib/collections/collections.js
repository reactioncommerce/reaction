import { Mongo } from "meteor/mongo";
import * as Schemas from "./schemas";
import { cartTransform } from "./helpers";

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
* Discounts Collection
*/
export const Discounts = new Mongo.Collection("Discounts");

Discounts.attachSchema(Schemas.Discounts);


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
    order.itemCount = () => {
      let count = 0;
      if (order && Array.isArray(order.items)) {
        for (const items of order.items) {
          count += items.quantity;
        }
      }
      return count;
    };
    return order;
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

Templates.attachSchema(Schemas.Templates);


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
