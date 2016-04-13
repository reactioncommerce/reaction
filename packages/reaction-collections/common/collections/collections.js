/**
* ReactionCore Collections
*/

/**
 * getSummary
 * @summary iterates over cart items with computations
 * @param {Array} items - cart.items array
 * @param {Array} prop - path to item property represented by array
 * @param {Array} [prop2] - path to another item property represented by array
 * @return {Number} - computations result
 */
function getSummary(items, prop, prop2) {
  if (Array.isArray(items)) {
    return items.reduce((sum, item) => {
      if (prop2) {
        // S + a * b, where b could be b1 or b2
        return sum + item[prop[0]] * (prop2.length === 1 ? item[prop2[0]] :
          item[prop2[0]][prop2[1]]);
      }
      // S + b, where b could be b1 or b2
      return sum + (prop.length === 1 ? item[prop[0]] :
        item[prop[0]][prop[1]]);
    }, 0);
  }

  // If data not prepared we should send a number to avoid exception with
  // `toFixed`. This could happens if user stuck on `completed` checkout stage
  // by some reason.
  return 0;
}

/**
* ReactionCore transform collections
*
* transform methods used to return cart calculated values
* cartCount, cartSubTotal, cartShipping, cartTaxes, cartTotal
* are calculated by a transformation on the collection
* and are available to use in template as cart.xxx
* in template: {{cart.cartCount}}
* in code: ReactionCore.Collections.Cart.findOne().cartTotal()
*/
ReactionCore.Helpers.cartTransform = {
  cartCount: function () {
    return getSummary(this.items, ["quantity"]);
  },
  cartShipping: function () {
    // loop through the cart.shipping, sum shipments.
    return parseFloat(getSummary(this.shipping, ["shipmentMethod", "rate"]));
  },
  cartSubTotal: function () {
    return getSummary(this.items, ["quantity"], ["variants", "price"]).
      toFixed(2);
  },
  cartTaxes: function () {
    const tax = this.tax || 0;
    return (getSummary(this.items, ["variants", "price"]) * tax).toFixed(2);
  },
  cartDiscounts: function () {
    return "0.00";
  },
  cartTotal: function () {
    let subTotal = getSummary(this.items, ["quantity"], ["variants", "price"]);
    // loop through the cart.shipping, sum shipments.
    let shippingTotal = getSummary(this.shipping, ["shipmentMethod", "rate"]);
    shippingTotal = parseFloat(shippingTotal);
    // TODO: includes taxes?
    if (typeof shippingTotal === "number" && shippingTotal > 0) {
      subTotal += shippingTotal;
    }
    return subTotal.toFixed(2);
  }
};

/**
* ReactionCore Collections Cart
*/
ReactionCore.Collections.Cart = new Mongo.Collection("Cart", {
  transform: function (cart) {
    let newInstance = Object.create(ReactionCore.Helpers.cartTransform);
    return _.extend(newInstance, cart);
  }
});

ReactionCore.Collections.Cart.attachSchema(ReactionCore.Schemas.Cart);

/**
* ReactionCore Collections Orders
*/
ReactionCore.Collections.Orders = this.Orders = new Mongo.Collection("Orders", {
  transform: function (order) {
    order.itemCount = function () {
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

ReactionCore.Collections.Orders.attachSchema([
  ReactionCore.Schemas.Cart,
  ReactionCore.Schemas.Order,
  ReactionCore.Schemas.OrderItem
]);


/**
 * ReactionCore Collections Accounts
 */
ReactionCore.Collections.Accounts = new Mongo.Collection("Accounts");

ReactionCore.Collections.Accounts.attachSchema(ReactionCore.Schemas.Accounts);

/**
* ReactionCore Collections Packages
*/
ReactionCore.Collections.Packages = new Mongo.Collection("Packages");

ReactionCore.Collections.Packages.attachSchema(ReactionCore.Schemas.PackageConfig);

/**
* ReactionCore Collections Products
*/
export const Products = ReactionCore.Collections.Products = new Mongo.Collection("Products");

ReactionCore.Collections.Products.attachSchema(ReactionCore.Schemas.Product,
  { selector: { type: "simple" } });
ReactionCore.Collections.Products.attachSchema(ReactionCore.Schemas.ProductVariant,
  { selector: { type: "variant" } });

/**
* ReactionCore Collections Shipping
*/
ReactionCore.Collections.Shipping = new Mongo.Collection("Shipping");

ReactionCore.Collections.Shipping.attachSchema(ReactionCore.Schemas.Shipping);

/**
* ReactionCore Collections Taxes
*/
ReactionCore.Collections.Taxes = new Mongo.Collection("Taxes");

ReactionCore.Collections.Taxes.attachSchema(ReactionCore.Schemas.Taxes);

/**
* ReactionCore Collections Discounts
*/
ReactionCore.Collections.Discounts = new Mongo.Collection("Discounts");

ReactionCore.Collections.Discounts.attachSchema(ReactionCore.Schemas.Discounts);

/**
* ReactionCore Collections Shops
*/
ReactionCore.Collections.Shops = new Mongo.Collection("Shops");

ReactionCore.Collections.Shops.attachSchema(ReactionCore.Schemas.Shop);

/**
* ReactionCore Collections Tags
*/
ReactionCore.Collections.Tags = new Mongo.Collection("Tags");

ReactionCore.Collections.Tags.attachSchema(ReactionCore.Schemas.Tag);

/**
* ReactionCore Collections Translations
*/
ReactionCore.Collections.Translations = new Mongo.Collection("Translations");

ReactionCore.Collections.Translations.attachSchema(ReactionCore.Schemas.Translation);

/**
* ReactionCore Collections Templates
*/
ReactionCore.Collections.Templates = new Mongo.Collection("Templates");

ReactionCore.Collections.Templates.attachSchema(ReactionCore.Schemas.Templates);

/**
* ReactionCore Collections Themes
*/
ReactionCore.Collections.Themes = new Mongo.Collection("Themes");

ReactionCore.Collections.Themes.attachSchema(ReactionCore.Schemas.Themes);


/**
 * ReactionCore Collections CronJobs
 */
ReactionCore.Collections.Jobs = new JobCollection("Jobs", {
  noCollectionSuffix: true
});
