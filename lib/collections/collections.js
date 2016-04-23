import Schemas from "./schemas";
import { cartTransform } from "./helpers";

/**
* ReactionCore Collections
*/

/*
 *  AnalyticsEvents Collection
 *  Store the Analytics Events in a Collection
 */
export const AnalyticsEvents = new Mongo.Collection("AnalyticsEvents");

AnalyticsEvents.attachSchema(Schemas.AnalyticsEvents);

/**
* ReactionCore Collections Cart
*/
export const Cart = new Mongo.Collection("Cart", {
  transform(cart) {
    let newInstance = Object.create(cartTransform);
    return _.extend(newInstance, cart);
  }
});

Cart.attachSchema(Schemas.Cart);

/**
* ReactionCore Collections Orders
*/
export const Orders = new Mongo.Collection("Orders", {
  transform(order) {
    order.itemCount = () => {
      let count = 0;
      if (order && Array.isArray(order.items)) {
        for (let items of order.items) {
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
 * ReactionCore Collections Accounts
 */
export const Accounts = new Mongo.Collection("Accounts");

Accounts.attachSchema(Schemas.Accounts);

/**
* ReactionCore Collections Inventory
*/
export const Inventory = new Mongo.Collection("Inventory");

Inventory.attachSchema(Schemas.Inventory);

/**
* ReactionCore Collections Packages
*/
export const Packages = new Mongo.Collection("Packages");

Packages.attachSchema(Schemas.PackageConfig);

/**
* ReactionCore Collections Products
*/
export const Products = new Mongo.Collection("Products");

Products.attachSchema(Schemas.Product, { selector: { type: "simple" } });
Products.attachSchema(Schemas.ProductVariant, { selector: { type: "variant" } });

/**
* ReactionCore Collections Shipping
*/
export const Shipping = new Mongo.Collection("Shipping");

Shipping.attachSchema(Schemas.Shipping);

/**
* ReactionCore Collections Taxes
*/
export const Taxes = new Mongo.Collection("Taxes");

Taxes.attachSchema(Schemas.Taxes);

/**
* ReactionCore Collections Discounts
*/
export const Discounts = new Mongo.Collection("Discounts");

Discounts.attachSchema(Schemas.Discounts);

/**
* ReactionCore Collections Shops
*/
export const Shops = new Mongo.Collection("Shops");

Shops.attachSchema(Schemas.Shop);

/**
* ReactionCore Collections Tags
*/
export const Tags = new Mongo.Collection("Tags");

Tags.attachSchema(Schemas.Tag);

/**
* ReactionCore Collections Translations
*/
export const Translations = new Mongo.Collection("Translations");

Translations.attachSchema(Schemas.Translation);

/**
* ReactionCore Collections Templates
*/
export const Templates = new Mongo.Collection("Templates");

Templates.attachSchema(Schemas.Templates);

/**
* ReactionCore Collections Themes
*/
export const Themes = new Mongo.Collection("Themes");

Themes.attachSchema(Schemas.Themes);


/**
 * ReactionCore Collections CronJobs
 */
export const Jobs = new JobCollection("Jobs", {
  noCollectionSuffix: true
});
