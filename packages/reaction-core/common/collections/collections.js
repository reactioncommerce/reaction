
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
var Cart, Orders, Products, Shops, Tags;
ReactionCore.Helpers.cartTransform = {
  cartCount: function() {
    var count, items, _i, _len, _ref;
    count = 0;
    if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        items = _ref[_i];
        count += items.quantity;
      }
    }
    return count;
  },
  cartShipping: function() {
    var shipping, shippingMethod, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    shipping = 0;
    if (typeof this !== "undefined" && this !== null ? (_ref = this.shipping) != null ? (_ref1 = _ref.shipmentMethod) != null ? _ref1.rate : void 0 : void 0 : void 0) {
      shipping = typeof this !== "undefined" && this !== null ? (_ref2 = this.shipping) != null ? (_ref3 = _ref2.shipmentMethod) != null ? _ref3.rate : void 0 : void 0 : void 0;
    } else if ((typeof this !== "undefined" && this !== null ? (_ref4 = this.shipping) != null ? _ref4.shipmentMethod.length : void 0 : void 0) > 0) {
      _ref5 = this.shipping.shipmentMethod;
      for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
        shippingMethod = _ref5[_i];
        shipping += shippingMethod.rate;
      }
    }
    return shipping;
  },
  cartSubTotal: function() {
    var items, subtotal, _i, _len, _ref;
    subtotal = 0;
    if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        items = _ref[_i];
        subtotal += items.quantity * items.variants.price;
      }
    }
    subtotal = subtotal.toFixed(2);
    return subtotal;
  },
  cartTaxes: function() {

    /*
     * TODO: lookup cart taxes, and apply rules here
     */
    return "0.00";
  },
  cartDiscounts: function() {

    /*
     * TODO: lookup discounts, and apply rules here
     */
    return "0.00";
  },
  cartTotal: function() {
    var items, shipping, shippingMethod, subtotal, total, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    subtotal = 0;
    if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        items = _ref[_i];
        subtotal += items.quantity * items.variants.price;
      }
    }
    shipping = 0;
    if (typeof this !== "undefined" && this !== null ? (_ref1 = this.shipping) != null ? (_ref2 = _ref1.shipmentMethod) != null ? _ref2.rate : void 0 : void 0 : void 0) {
      shipping = typeof this !== "undefined" && this !== null ? (_ref3 = this.shipping) != null ? (_ref4 = _ref3.shipmentMethod) != null ? _ref4.rate : void 0 : void 0 : void 0;
    } else if ((typeof this !== "undefined" && this !== null ? (_ref5 = this.shipping) != null ? _ref5.shipmentMethod.length : void 0 : void 0) > 0) {
      _ref6 = this.shipping.shipmentMethod;
      for (_j = 0, _len1 = _ref6.length; _j < _len1; _j++) {
        shippingMethod = _ref6[_j];
        shipping += shippingMethod.rate;
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
  transform: function(cart) {
    var newInstance;
    newInstance = Object.create(ReactionCore.Helpers.cartTransform);
    return _.extend(newInstance, cart);
  }
});

ReactionCore.Collections.Cart.attachSchema(ReactionCore.Schemas.Cart);

/**
* ReactionCore Collections Accounts
*/
ReactionCore.Collections.Accounts = new Mongo.Collection("Accounts");

ReactionCore.Collections.Accounts.attachSchema(ReactionCore.Schemas.Accounts);

/**
* ReactionCore Collections Orders
*/
ReactionCore.Collections.Orders = Orders = this.Orders = new Mongo.Collection("Orders", {
  transform: function(order) {
    order.itemCount = function() {
      var count, items, _i, _len, _ref;
      count = 0;
      if (order != null ? order.items : void 0) {
        _ref = order.items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          items = _ref[_i];
          count += items.quantity;
        }
      }
      return count;
    };
    return order;
  }
});

ReactionCore.Collections.Orders.attachSchema([ReactionCore.Schemas.Cart, ReactionCore.Schemas.Order, ReactionCore.Schemas.OrderItems]);

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
ReactionCore.Collections.Shops = Shops = this.Shops = new Mongo.Collection("Shops", {
  transform: function(shop) {
    var index, member, _ref;
    _ref = shop.members;
    for (index in _ref) {
      member = _ref[index];
      member.index = index;
      member.user = Meteor.users.findOne(member.userId);
    }
    return shop;
  }
});

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
