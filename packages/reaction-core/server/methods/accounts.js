/**
 * Reaction Accounts handlers
 */

Accounts.registerLoginHandler(function (options) {
  var hashStampedToken, loginHandler, stampedToken, userId;
  if (!options.anonymous) {
    return void 0;
  }
  stampedToken = Accounts._generateStampedLoginToken();
  hashStampedToken = Accounts._hashStampedToken(stampedToken);
  userId = Accounts.insertUserDoc({
    profile: {
      anonymous: true
    },
    token: stampedToken.token
  });
  loginHandler = {
    type: 'anonymous',
    userId: userId
  };
  return loginHandler;
});


/**
 * onCreateUser
 * adding either a guest or anonymous role to the user on create
 * adds Accounts record for reaction user profiles
 * see: http://docs.meteor.com/#/full/accounts_oncreateuser
 */

Accounts.onCreateUser(function (options, user) {
  var Cart, account, accountId, profile, roles, service, sessionId, shop, shopId, _ref, _ref1;
  if (!user.emails) {
    user.emails = [];
  }
  shopId = ReactionCore.getShopId();
  shop = ReactionCore.getCurrentShop();
  sessionId = ReactionCore.sessionId;
  Cart = ReactionCore.Collections.Cart;
  user.roles = roles = user.roles || {};
  _ref = user.services;
  for (service in _ref) {
    profile = _ref[service];
    if (!user.username && profile.name) {
      user.username = profile.name;
    }
    if (profile.email) {
      user.emails.push({
        'address': profile.email
      });
    }
  }

  // add default user roles
  if (shop) {
    if (user.emails.length > 0) {
      user.roles[shopId] = shop.defaultRoles || ["guest", "account/profile"];
    } else {
      user.roles[shopId] = shop.defaultVisitorRole || ["anonymous", "guest", "account/profile"];
    }
  }

  // clone user into account
  account = _.clone(user);
  account.userId = user._id;
  accountId = ReactionCore.Collections.Accounts.insert(account);
  return user;
});


/**
 * Accounts.onLogin Events
 * Every visitor to reaction gets an account, and is
 * automatically logged in.
 * The distinction is with the role of anonymous
 * which is a user that has not authenticated "registered".
 *
 * A Guest is a user that has authenticated,
 * and we remove the "anonymous" role.
 *
 */

Accounts.onLogin(function (options) {
  var user = options.user;
  var userId = options.user._id;
  var shopId = ReactionCore.getShopId();
  var sessionId = ReactionCore.sessionId;
  var Cart = ReactionCore.Collections.Cart;

  // find current cart
  currentCart = Cart.findOne({
    userId: userId
  });

  // find carts this user might have had
  // while anonymous and merge into user cart
  sessionCarts = Cart.find({
    'sessions': {
      $in: [sessionId]
    }
  });

  // if no session cart or currentCart
  // create a new cart
  if (!currentCart && sessionCarts.count() === 0) {
    newCartId = Cart.insert({
      sessions: [sessionId],
      shopId: shopId,
      userId: userId
    });
    ReactionCore.Events.info("created cart: " + newCartId + " for " + userId);
  }

  // if there is a cart, and the user is logged
  // in with an email they are no longer anonymous.
  if (currentCart && user.emails.length > 0) {
    update = {
      $pullAll: {}
    };
    update.$pullAll['roles.' + shopId] = ['anonymous'];
    Meteor.users.update({
      _id: userId
    }, update, {
      multi: true
    });
    ReactionCore.Events.info("removed anonymous role from user: " + userId);
  }

  // if there is a cart, but multiple session carts
  // we're going to merge the session carts in to the authenticated user cart.
  if (currentCart && sessionCarts.count() >= 2) {
    ReactionCore.Events.info("multiple carts found for user " + userId);
    Meteor.call("mergeCart", currentCart._id, function (error, result) {
      console.log(error, result);
      ReactionCore.Events.info("merged cart: " + currentCart._id + " for " + userId);
    });
  }

  // if there isn't an authenticated cart, but there is a session cart.
  if (!currentCart && sessionCarts.count() === 1) {
    sessionCart = sessionCarts.fetch()[0];
    ReactionCore.Collections.Cart.update(sessionCart._id, {
      $set: {
        userId: userId
      }
    });

    ReactionCore.Events.info("update session cart: " + sessionCart._id + " with user: " + userId);
  }




});

/**
 * Reaction Account Methods
 */

Meteor.methods({
  /**
   * check if current user has password
   */
  currentUserHasPassword: function () {
    var user;
    user = Meteor.users.findOne(Meteor.userId());
    if (user.services.password) {
      return true;
    }
    return false;
  },

  /**
   * add new addresses to an account
   */
  addressBookAdd: function (doc, accountId) {
    this.unblock();
    check(doc, ReactionCore.Schemas.Address);
    check(accountId, String);
    ReactionCore.Schemas.Address.clean(doc);
    if (doc.isShippingDefault || doc.isBillingDefault) {
      if (doc.isShippingDefault) {
        ReactionCore.Collections.Accounts.update({
          "_id": accountId,
          "userId": accountId,
          "profile.addressBook.isShippingDefault": true
        }, {
          $set: {
            "profile.addressBook.$.isShippingDefault": false
          }
        });
      }
      if (doc.isBillingDefault) {
        ReactionCore.Collections.Accounts.update({
          '_id': accountId,
          "userId": accountId,
          "profile.addressBook.isBillingDefault": true
        }, {
          $set: {
            "profile.addressBook.$.isBillingDefault": false
          }
        });
      }
    }
    ReactionCore.Collections.Accounts.upsert(accountId, {
      $set: {
        "userId": accountId
      },
      $addToSet: {
        "profile.addressBook": doc
      }
    });
    return doc;
  },

  /**
   * update existing address in user's profile
   */
  addressBookUpdate: function (doc, accountId) {
    this.unblock();
    check(doc, ReactionCore.Schemas.Address);
    check(accountId, String);
    if (doc.isShippingDefault || doc.isBillingDefault) {
      if (doc.isShippingDefault) {
        ReactionCore.Collections.Accounts.update({
          "_id": accountId,
          "profile.addressBook.isShippingDefault": true
        }, {
          $set: {
            "profile.addressBook.$.isShippingDefault": false
          }
        });
      }
      if (doc.isBillingDefault) {
        ReactionCore.Collections.Accounts.update({
          "_id": accountId,
          "profile.addressBook.isBillingDefault": true
        }, {
          $set: {
            "profile.addressBook.$.isBillingDefault": false
          }
        });
      }
    }
    ReactionCore.Collections.Accounts.update({
      "_id": accountId,
      "profile.addressBook._id": doc._id
    }, {
      $set: {
        "profile.addressBook.$": doc
      }
    });
    return doc;
  },

  /**
   * remove existing address in user's profile
   */
  addressBookRemove: function (doc, accountId) {
    this.unblock();
    check(doc, ReactionCore.Schemas.Address);
    check(accountId, String);
    ReactionCore.Collections.Accounts.update({
      "_id": accountId,
      "profile.addressBook._id": doc._id
    }, {
      $pull: {
        "profile.addressBook": {
          "_id": doc._id
        }
      }
    });
    return doc;
  },

  /**
   * invite new admin users
   * (not consumers) to secure access in the dashboard
   * to permissions as specified in packages/roles
   */
  inviteShopMember: function (shopId, email, name) {
    var currentUserName, shop, token, user, userId, _ref, _ref1, _ref2;
    check(shopId, String);
    check(email, String);
    check(name, String);
    this.unblock();
    shop = Shops.findOne(shopId);

    if (!ReactionCore.hasOwnerAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }

    ReactionCore.configureMailUrl();

    if (shop && email && name) {
      currentUserName = ((_ref = Meteor.user()) !== null ? (_ref1 = _ref.profile) !== null ? _ref1.name : void 0 : void 0) || ((_ref2 = Meteor.user()) !== null ? _ref2.username : void 0) || "Admin";
      user = Meteor.users.findOne({
        "emails.address": email
      });

      if (!user) {
        userId = Accounts.createUser({
          email: email,
          username: name
        });
        user = Meteor.users.findOne(userId);
        if (!user) {
          throw new Error("Can't find user");
        }
        token = Random.id();
        Meteor.users.update(userId, {
          $set: {
            "services.password.reset": {
              token: token,
              email: email,
              when: new Date()
            }
          }
        });
        SSR.compileTemplate('shopMemberInvite', Assets.getText('server/emailTemplates/shopMemberInvite.html'));
        try {
          Email.send({
            to: email,
            from: currentUserName + " <" + shop.emails[0] + ">",
            subject: "You have been invited to join " + shop.name,
            html: SSR.render('shopMemberInvite', {
              homepage: Meteor.absoluteUrl(),
              shop: shop,
              currentUserName: currentUserName,
              invitedUserName: name,
              url: Accounts.urls.enrollAccount(token)
            })
          });
        } catch (_error) {
          throw new Meteor.Error(403, "Unable to send invitation email.");
        }
      } else {
        SSR.compileTemplate('shopMemberInvite', Assets.getText('server/emailTemplates/shopMemberInvite.html'));
        try {
          Email.send({
            to: email,
            from: currentUserName + " <" + shop.emails[0] + ">",
            subject: "You have been invited to join the " + shop.name,
            html: SSR.render('shopMemberInvite', {
              homepage: Meteor.absoluteUrl(),
              shop: shop,
              currentUserName: currentUserName,
              invitedUserName: name,
              url: Meteor.absoluteUrl()
            })
          });
        } catch (_error) {
          throw new Meteor.Error(403, "Unable to send invitation email.");
        }
      }
    } else {
      throw new Meteor.Error(403, "Access denied");
    }
    return true;
  },

  /**
   * send an email to consumers on sign up
   */
  sendWelcomeEmail: function (shopId, userId) {
    var email;
    check(shop, Object);
    this.unblock();
    email = Meteor.user(userId).emails[0].address;
    ReactionCore.configureMailUrl();
    SSR.compileTemplate('welcomeNotification', Assets.getText('server/emailTemplates/welcomeNotification.html'));
    Email.send({
      to: email,
      from: shop.emails[0],
      subject: "Welcome to " + shop.name + "!",
      html: SSR.render('welcomeNotification', {
        homepage: Meteor.absoluteUrl(),
        shop: shop,
        user: Meteor.user()
      })
    });
    return true;
  },

  /**
   * addUserPermissions
   * @param {Array|String} permission
   *               Name of role/permission.  If array, users
   *               returned will have at least one of the roles
   *               specified but need not have _all_ roles.
   * @param {String} [group] Optional name of group to restrict roles to.
   *                         User's Roles.GLOBAL_GROUP will also be checked.
   * @returns {Boolean} success/failure
   */
  addUserPermissions: function (userId, permissions, group) {
    var e;
    check(userId, Match.OneOf(String, Array));
    check(permissions, Match.OneOf(String, Array));
    check(group, Match.Optional(String));
    this.unblock();
    try {
      return Roles.addUsersToRoles(userId, permissions, group);
    } catch (_error) {
      e = _error;
      return ReactionCore.Events.info(e);
    }
  },

  /**
   * removeUserPermissions
   */
  removeUserPermissions: function (userId, permissions, group) {
    var error;
    console.log(userId, permissions, group);
    check(userId, String);
    check(permissions, Match.OneOf(String, Array));
    check(group, Match.Optional(String, null));
    this.unblock();
    try {
      return console.log(Roles.removeUsersFromRoles(userId, permissions, group));
    } catch (_error) {
      error = _error;
      ReactionCore.Events.info(error);
      throw new Meteor.Error(403, "Access Denied");
    }
  },

  /**
   * setUserPermissions
   */
  setUserPermissions: function (userId, permissions, group) {
    var e;
    check(userId, String);
    check(permissions, Match.OneOf(String, Array));
    check(group, Match.Optional(String));
    this.unblock();
    try {
      return Roles.setUserRoles(userId, permissions, group);
    } catch (_error) {
      e = _error;
      return ReactionCore.Events.info(e);
    }
  }
});
