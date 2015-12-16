/**
* ReactionCore Collections
*
*
* transform methods used to return cart calculated values
* cartCount, cartSubTotal, cartShipping, cartTaxes, cartTotal
* are calculated by a transformation on the collection
* and are available to use in template as cart.xxx
* in template: {{cart.cartCount}}
* in code: ReactionCore.Collections.Cart.findOne().cartTotal()
*/

/**
* ReactionCore transform collections
*/
ReactionCore.Helpers.cartTransform = {
  cartCount: function () {
    let count = 0;
    if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
      for (let items of this.items) {
        count += items.quantity;
      }
    }
    return count;
  },
  cartShipping: function () {
    let shippingTotal = 0;
    // loop through the cart.shipping, sum shipments.
    if (this.shipping) {
      for (let shipment of this.shipping) {
        shippingTotal += shipment.shipmentMethod.rate;
      }
    }
    return parseFloat(shippingTotal);
  },
  cartSubTotal: function () {
    let subtotal = 0;
    if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
      for (let items of this.items) {
        subtotal += items.quantity * items.variants.price;
      }
    }
    subtotal = subtotal.toFixed(2);
    return subtotal;
  },
  cartTaxes: function () {
    let subtotal = 0;
    if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
      for (let items of this.items) {
        let tax = this.tax || 0;
        subtotal += items.variants.price * tax;
      }
    }
    subtotal = subtotal.toFixed(2);
    return subtotal;
  },
  cartDiscounts: function () {
    return "0.00";
  },
  cartTotal: function () {
    let total;
    let subtotal = 0;
    let shippingTotal = 0;
    if (this.items) {
      for (let items of this.items) {
        subtotal += items.quantity * items.variants.price;
      }
    }
    // loop through the cart.shipping, sum shipments.
    if (this.shipping) {
      for (let shipment of this.shipping) {
        shippingTotal += shipment.shipmentMethod.rate;
      }
    }

    shippingTotal = parseFloat(shippingTotal);
    if (!isNaN(shippingTotal)) {
      subtotal = subtotal + shippingTotal;
    }
    total = subtotal.toFixed(2);
    return total;
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
      if (order !== null ? order.items : void 0) {
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
ReactionCore.Collections.Products = new Mongo.Collection("Products");

ReactionCore.Collections.Products.attachSchema([
    { schema: ReactionCore.Schemas.Product, selector: { type: 'simple' }},
    { schema: ReactionCore.Schemas.ProductVariant, selector: { type: 'variant' }}],
  { multiple: true }
);

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
* ReactionCore Collections Layouts
*/
ReactionCore.Collections.Layouts = new Mongo.Collection("Layouts");

ReactionCore.Collections.Layouts.attachSchema(ReactionCore.Schemas.Layouts);

/**
* ReactionCore Collections Templates
*/
ReactionCore.Collections.Templates = new Mongo.Collection("Templates");

ReactionCore.Collections.Templates.attachSchema(ReactionCore.Schemas.Templates);

/**
 * ReactionCore Collections CronJobs
 */
ReactionCore.Collections.Jobs = new JobCollection("Jobs", {
  noCollectionSuffix: true
});
