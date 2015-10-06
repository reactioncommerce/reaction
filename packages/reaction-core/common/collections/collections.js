
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
    let shipping = 0;
    if (this.shipping) {
      if (this.shipping.shipmentMethod) {
        for (let shippingMethod of this.shipping.shipmentMethod) {
          shipping += shippingMethod.rate;
        }
      }
    }
    return shipping;
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
        subtotal += items.variants.price * this.tax;
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
    if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
      for (let items of this.items) {
        subtotal += items.quantity * items.variants.price;
      }
    }
    let shipping = 0;
    if (this.shipping) {
      if (this.shipping.shippingMethod) {
        for (let shippingMethod of this.shipping.shippingMethod) {
          shipping += shippingMethod.rate;
        }
      }
    }

    shipping = parseFloat(shipping);
    if (!isNaN(shipping)) {
      subtotal = subtotal + shipping;
    }
    total = subtotal.toFixed(2);
    return total;
  }
};

/**
* ReactionCore Collections Cart
*/
ReactionCore.Collections.Cart = Cart = this.Cart = new Mongo.Collection("Cart", {
  transform: function (cart) {
    let newInstance = Object.create(ReactionCore.Helpers.cartTransform);
    return _.extend(newInstance, cart);
  }
});

ReactionCore.Collections.Cart.attachSchema(ReactionCore.Schemas.Cart);


/**
* ReactionCore Collections Orders
*/
ReactionCore.Collections.Orders = Orders = this.Orders = new Mongo.Collection("Orders", {
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
* ReactionCore Collections Packages
*/
ReactionCore.Collections.Packages = new Mongo.Collection("Packages");

ReactionCore.Collections.Packages.attachSchema(ReactionCore.Schemas.PackageConfig);

/**
* ReactionCore Collections Products
*/
ReactionCore.Collections.Products = Products = this.Products = new Mongo.Collection("Products");

ReactionCore.Collections.Products.attachSchema(ReactionCore.Schemas.Product);

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
ReactionCore.Collections.Shops = Shops = this.Shops = new Mongo.Collection("Shops");

ReactionCore.Collections.Shops.attachSchema(ReactionCore.Schemas.Shop);

/**
* ReactionCore Collections Tags
*/
ReactionCore.Collections.Tags = Tags = this.Tags = new Mongo.Collection("Tags");

ReactionCore.Collections.Tags.attachSchema(ReactionCore.Schemas.Tag);

/**
* ReactionCore Collections Translations
*/
ReactionCore.Collections.Translations = new Mongo.Collection("Translations");

ReactionCore.Collections.Translations.attachSchema(ReactionCore.Schemas.Translation);

/**
* ReactionCore Collections Accounts
*/
ReactionCore.Collections.Layouts = new Mongo.Collection("Layouts");

ReactionCore.Collections.Layouts.attachSchema(ReactionCore.Schemas.Layouts);
