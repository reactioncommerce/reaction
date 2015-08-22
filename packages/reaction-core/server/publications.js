/*
 * local collection convenience variables
 */

var Accounts, Cart, Discounts, Media, Orders, Packages, Products, Shipping, Shops, Tags, Taxes, Translations;

Cart = ReactionCore.Collections.Cart;

Accounts = ReactionCore.Collections.Accounts;

Discounts = ReactionCore.Collections.Discounts;

Media = ReactionCore.Collections.Media;

Orders = ReactionCore.Collections.Orders;

Packages = ReactionCore.Collections.Packages;

Products = ReactionCore.Collections.Products;

Shipping = ReactionCore.Collections.Shipping;

Shops = ReactionCore.Collections.Shops;

Tags = ReactionCore.Collections.Tags;

Taxes = ReactionCore.Collections.Taxes;

Translations = ReactionCore.Collections.Translations;


/**
 * Reaction Server / amplify permanent sessions
 * If no id is passed we create a new session
 * Load the session
 * If no session is loaded, creates a new one
 */

this.ServerSessions = new Mongo.Collection("Sessions");

Meteor.publish('Sessions', function(id) {
  var created, serverSession;
  check(id, Match.OneOf(String, null));
  created = new Date().getTime();
  if (!id) {
    id = ServerSessions.insert({
      created: created
    });
  }
  serverSession = ServerSessions.find(id);
  if (serverSession.count() === 0) {
    id = ServerSessions.insert({
      created: created
    });
    serverSession = ServerSessions.find(id);
  }
  ReactionCore.sessionId = id;
  return serverSession;
});


/**
 * CollectionFS - Image/Video Publication
 * @params {Array} shops - array of current shop object
 */

Meteor.publish("Media", function(shops) {
  var selector, shopId;
  check(shops, Match.Optional(Array));
  shopId = ReactionCore.getShopId(this);
  if (shopId) {
    selector = {
      'metadata.shopId': shopId
    };
  }
  if (shops) {
    selector = {
      'metadata.shopId': {
        $in: shops
      }
    };
  }
  return Media.find(selector, {
    sort: {
      "metadata.priority": 1
    }
  });
});


/**
 * i18n - translations
 * @params {String} sessionLanguage - current sessionLanguage default to 'en'
 */

Meteor.publish("Translations", function(sessionLanguage) {
  check(sessionLanguage, String);
  return Translations.find({
    $or: [
      {
        'i18n': 'en'
      }, {
        'i18n': sessionLanguage
      }
    ]
  });
});


/**
 * userProfile
 * get any user name,social profile image
 * should be limited, secure information
 * users with permissions  ['dashboard/orders', 'owner', 'admin', 'dashboard/customers']
 * may view the profileUserId's profile data.
 *
 * @params {String} profileUserId -  view this users profile when permitted
 */

Meteor.publish("UserProfile", function(profileUserId) {
  var permissions;
  check(profileUserId, Match.OneOf(String, null));
  permissions = ['dashboard/orders', 'owner', 'admin', 'dashboard/customers'];
  if (profileUserId !== this.userId && (Roles.userIsInRole(this.userId, permissions, ReactionCore.getCurrentShop(this)._id || Roles.userIsInRole(this.userId, permissions, Roles.GLOBAL_GROUP)))) {
    return Meteor.users.find({
      _id: profileUserId
    }, {
      fields: {
        "emails": true,
        "profile.firstName": true,
        "profile.lastName": true,
        "profile.familyName": true,
        "profile.secondName": true,
        "profile.name": true,
        "services.twitter.profile_image_url_https": true,
        "services.facebook.id": true,
        "services.google.picture": true,
        "services.github.username": true,
        "services.instagram.profile_picture": true
      }
    });
  } else if (this.userId) {
    return Meteor.users.find({
      _id: this.userId
    });
  } else {
    return [];
  }
});


/**
 *  Packages contains user specific configuration
 *  settings, package access rights
 *  @params {Object} shop - current shop object
 */

Meteor.publish('Packages', function(shop) {
  check(shop, Match.Optional(Object));
  shop = shop || ReactionCore.getCurrentShop(this);
  if (shop) {
    if (Roles.userIsInRole(this.userId, ['dashboard', 'owner', 'admin'], ReactionCore.getShopId(this) || Roles.userIsInRole(this.userId, ['owner', 'admin'], Roles.GLOBAL_GROUP))) {
      return Packages.find({
        shopId: shop._id
      });
    } else {
      return Packages.find({
        shopId: shop._id
      }, {
        fields: {
          shopId: true,
          name: true,
          enabled: true,
          registry: true,
          'settings.public': true
        }
      });
    }
  } else {
    return [];
  }
});


/**
* shops
*  @returns {Cursor} shop - current shop
*/

Meteor.publish('Shops', function() {
  return ReactionCore.getCurrentShopCursor(this);
});


/**
 * ShopMembers
 */

Meteor.publish('ShopMembers', function() {
  var permissions, shopId;
  permissions = ['dashboard/orders', 'owner', 'admin', 'dashboard/customers'];
  shopId = ReactionCore.getShopId(this);
  if (Roles.userIsInRole(this.userId, permissions, shopId)) {
    return Meteor.users.find('roles.' + {
      shopId: {
        $nin: ['anonymous']
      }
    }, {
      fields: {
        _id: 1,
        email: 1,
        username: 1,
        roles: 1
      }
    });
  } else {
    ReactionCore.Events.info("ShopMembers access denied");
    return [];
  }
});


/**
 * products
 */

Meteor.publish('Products', function(shops) {
  var selector, shop, shopAdmin, _i, _len;
  check(shops, Match.Optional(Array));
  shop = ReactionCore.getCurrentShop(this);
  if (shop) {
    selector = {
      shopId: shop._id
    };
    if (shops) {
      selector = {
        shopId: {
          $in: shops
        }
      };
      for (_i = 0, _len = shops.length; _i < _len; _i++) {
        shop = shops[_i];
        if (Roles.userIsInRole(this.userId, ['admin', 'createProduct'], shop._id)) {
          shopAdmin = true;
        }
      }
    }
    if (!(Roles.userIsInRole(this.userId, ['owner'], shop._id) || shopAdmin)) {
      selector.isVisible = true;
    }
    return Products.find(selector, {
      sort: {
        title: 1
      }
    });
  } else {
    return [];
  }
});

Meteor.publish('Product', function(productId) {
  var selector, shop;
  check(productId, String);
  shop = ReactionCore.getCurrentShop(this);
  selector = {};
  selector.isVisible = true;
  if (Roles.userIsInRole(this.userId, ['owner', 'admin', 'createProduct'], shop._id)) {
    selector.isVisible = {
      $in: [true, false]
    };
  }
  if (productId.match(/^[A-Za-z0-9]{17}$/)) {
    selector._id = productId;
  } else {
    selector.handle = {
      $regex: productId,
      $options: "i"
    };
  }
  return Products.find(selector);
});


/**
 * orders
 */

Meteor.publish('Orders', function(userId) {
  check(userId, Match.Optional(String));
  if (Roles.userIsInRole(this.userId, ['admin', 'owner'], ReactionCore.getShopId(this))) {
    return Orders.find({
      shopId: ReactionCore.getShopId(this)
    });
  } else {
    return [];
  }
});


/**
 * account orders
 */

Meteor.publish('AccountOrders', function(userId, shopId) {
  check(userId, Match.OptionalOrNull(String));
  check(shopId, Match.OptionalOrNull(String));
  shopId = shopId || ReactionCore.getShopId(this);
  if (userId && userId !== this.userId) {
    return [];
  }
  return Orders.find({
    'shopId': shopId,
    'userId': this.userId
  });
});


/**
 * cart
 */

Meteor.publish('Cart', function(userId) {
  check(userId, Match.OptionalOrNull(String));
  if (!this.userId) {
    return;
  }
  return ReactionCore.Collections.Cart.find({
    userId: this.userId
  });
});


/**
 * accounts
 */

Meteor.publish('Accounts', function(userId) {
  var accountId, _ref;
  check(userId, Match.OneOf(String, null));
  if (Roles.userIsInRole(this.userId, ['owner'], Roles.GLOBAL_GROUP)) {
    return Accounts.find();
  } else if (Roles.userIsInRole(this.userId, ['admin', 'owner'], ReactionCore.getShopId(this))) {
    return Accounts.find({
      shopId: ReactionCore.getShopId(this)
    });
  } else {
    accountId = (_ref = ReactionCore.Collections.Accounts.findOne({
      'userId': this.userId
    })) != null ? _ref._id : void 0;
    if (accountId) {
      ReactionCore.Events.info("publishing account", accountId);
      return ReactionCore.Collections.Accounts.find(accountId, {
        'userId': this.userId
      });
    }
  }
});


/**
 * tags
 */

Meteor.publish("Tags", function() {
  return Tags.find({
    shopId: ReactionCore.getShopId()
  });
});


/**
 * shipping
 */

Meteor.publish("Shipping", function() {
  return Shipping.find({
    shopId: ReactionCore.getShopId()
  });
});


/**
 * taxes
 */

Meteor.publish("Taxes", function() {
  return Taxes.find({
    shopId: ReactionCore.getShopId()
  });
});


/**
 * discounts
 */

Meteor.publish("Discounts", function() {
  return Discounts.find({
    shopId: ReactionCore.getShopId()
  });
});
