/**
 * Reaction Accounts handlers
 * creates a login type "anonymous"
 * default for all unauthenticated visitors
 */

Accounts.registerLoginHandler(function (options) {
  if (!options.anonymous) {
    return void 0;
  }
  let loginHandler;
  let stampedToken = Accounts._generateStampedLoginToken();
  let userId = Accounts.insertUserDoc({
    services: {
      anonymous: true
    },
    token: stampedToken.token
  });
  loginHandler = {
    type: "anonymous",
    userId: userId
  };
  return loginHandler;
});

/**
 * Accounts.onCreateUser event
 * adding either a guest or anonymous role to the user on create
 * adds Accounts record for reaction user profiles
 * we clone the user into accounts, as the user collection is
 * only to be used for authentication.
 *
 * see: http://docs.meteor.com/#/full/accounts_oncreateuser
 */
// using a generator function
function services(obj) {
  for (let key of Object.keys(obj)) {
    return [key, obj[key]];
  }
}

Accounts.onCreateUser(function (options, user) {
  let shop = ReactionCore.getCurrentShop();
  let shopId = ReactionCore.getShopId();
  let roles = {};
  if (!user.emails) user.emails = [];
  // init default user roles
  if (shop) {
    if (user.services === undefined) {
      roles[shopId] = shop.defaultVisitorRole || ["anonymous", "guest"];
    } else {
      roles[shopId] = shop.defaultRoles || ["guest", "account/profile"];
      // also add services with email defined to user.emails[]
      for (let service of services(user.services)) {
        if (service.email) {
          email = {
            provides: "default",
            address: service.email,
            verified: true
          };
          user.emails.push(email);
        }
      }
    }
  }
  // clone before adding roles
  let account = _.clone(user);
  account.userId = user._id;
  ReactionCore.Collections.Accounts.insert(account);
  // assign default user roles
  user.roles = roles;
  return user;
});

/**
 * Accounts.onLogin event
 * automatically push checkoutLogin when users login.
 * let"s remove "anonymous" role, if the login type isn't "anonymous"
 * @param
 * @returns
 */
Accounts.onLogin(function (options) {
  // remove anonymous role
  // all users are guest, but anonymous user don"t have profile access
  // or ability to order history, etc. so ensure its removed upon login.
  if (options.type !== "anonymous" && options.type !== "resume") {
    let update = {
      $pullAll: {}
    };

    update.$pullAll["roles." + ReactionCore.getShopId()] = ["anonymous"];

    Meteor.users.update({
      _id: options.user._id
    }, update, {
      multi: true
    });
    // debug info
    ReactionCore.Log.debug("removed anonymous role from user: " + options.user._id);

    // onLogin, we want to merge session cart into user cart.
    cart = ReactionCore.Collections.Cart.findOne({
      userId: options.user._id
    });
    Meteor.call("cart/mergeCart", cart._id);

    // logged in users need an additonal worfklow push to get started with checkoutLogin
    return Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin");
  }
});

/**
 * Reaction Account Methods
 */
Meteor.methods({
  /*
   * check if current user has password
   */
  "accounts/currentUserHasPassword": function () {
    let user;
    user = Meteor.users.findOne(Meteor.userId());
    if (user.services.password) {
      return true;
    }
    return false;
  },

  /**
   * accounts/addressBookAdd
   * @description add new addresses to an account
   * @param {Object} doc - address
   * @param {String} accountId - `account._id` which is need to be updated
   * @return {Object} doc - address
   */
  "accounts/addressBookAdd": function (doc, accountId) {
    check(doc, ReactionCore.Schemas.Address);
    check(accountId, String);
    if (accountId !== Meteor.userId() || !ReactionCore.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }
    this.unblock();

    if (!doc._id) {
      doc._id = Random.id();
    }

    ReactionCore.Schemas.Address.clean(doc);
    if (doc.isShippingDefault || doc.isBillingDefault) {
      if (doc.isShippingDefault) {
        ReactionCore.Collections.Accounts.update({
          "_id": accountId,
          "userId": accountId, // TODO: in some future cases maybe we should have
          // adminId here
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
        userId: accountId
      },
      $addToSet: {
        "profile.addressBook": doc
      }
    });
    return doc; // TODO: do we need to return an address back here?
    // maybe we should return nothing or `upsert` result?
  },

  /**
   * accounts/addressBookUpdate
   * @description update existing address in user's profile
   * @param {Object} doc - address
   * @param {String} accountId - `account._id` which is need to be updated
   * @return {Object} doc - address
   */
  "accounts/addressBookUpdate": function (doc, accountId) {
    check(doc, ReactionCore.Schemas.Address);
    check(accountId, String);
    if (accountId !== Meteor.userId() || !ReactionCore.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }
    this.unblock();

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
   * accounts/addressBookRemove
   * @description remove existing address in user's profile
   * @param {Object} doc - address
   * @param {String} accountId - `account._id` which is need to be updated
   * @return {Object} doc - address
   */
  "accounts/addressBookRemove": function (doc, accountId) {
    check(doc, ReactionCore.Schemas.Address);
    check(accountId, String);
    if (accountId !== Meteor.userId() || !ReactionCore.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }
    this.unblock();

    ReactionCore.Collections.Accounts.update({
      "_id": accountId,
      "profile.addressBook._id": doc._id
    }, {
      $pull: {
        "profile.addressBook": {
          _id: doc._id
        }
      }
    });
    return doc;
  },

  /*
   * invite new admin users
   * (not consumers) to secure access in the dashboard
   * to permissions as specified in packages/roles
   */
  "accounts/inviteShopMember": function (shopId, email, name) {
    if (!ReactionCore.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }
    let currentUserName;
    let shop;
    let token;
    let user;
    let userId;
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
      let currentUser = Meteor.user();
      if (currentUser) {
        if (currentUser.profile) {
          currentUserName = currentUser.profile.name;
        } else {
          currentUserName = currentUser.username;
        }
      } else {
        currentUserName = "Admin";
      }

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
        SSR.compileTemplate("shopMemberInvite", Assets.getText("server/emailTemplates/shopMemberInvite.html"));
        try {
          Email.send({
            to: email,
            from: currentUserName + " <" + shop.emails[0].address + ">",
            subject: "You have been invited to join " + shop.name,
            html: SSR.render("shopMemberInvite", {
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
        SSR.compileTemplate("shopMemberInvite", Assets.getText("server/emailTemplates/shopMemberInvite.html"));
        try {
          Email.send({
            to: email,
            from: currentUserName + " <" + shop.emails[0].address + ">",
            subject: "You have been invited to join the " + shop.name,
            html: SSR.render("shopMemberInvite", {
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

  /*
   * send an email to consumers on sign up
   */
  "accounts/sendWelcomeEmail": function (shopId, userId) {
    let email;
    check(shop, Object);
    this.unblock();
    email = Meteor.user(userId).emails[0].address;
    ReactionCore.configureMailUrl();
    SSR.compileTemplate("welcomeNotification", Assets.getText("server/emailTemplates/welcomeNotification.html"));
    Email.send({
      to: email,
      from: shop.emails[0],
      subject: "Welcome to " + shop.name + "!",
      html: SSR.render("welcomeNotification", {
        homepage: Meteor.absoluteUrl(),
        shop: shop,
        user: Meteor.user()
      })
    });
    return true;
  },

  /*
   * accounts/addUserPermissions
   * @param {Array|String} permission
   *               Name of role/permission.  If array, users
   *               returned will have at least one of the roles
   *               specified but need not have _all_ roles.
   * @param {String} [group] Optional name of group to restrict roles to.
   *                         User"s Roles.GLOBAL_GROUP will also be checked.
   * @returns {Boolean} success/failure
   */
  "accounts/addUserPermissions": function (userId, permissions, group) {
    if (!ReactionCore.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }
    check(userId, Match.OneOf(String, Array));
    check(permissions, Match.OneOf(String, Array));
    check(group, Match.Optional(String));
    this.unblock();
    try {
      return Roles.addUsersToRoles(userId, permissions, group);
    } catch (error) {
      return ReactionCore.Log.info(error);
    }
  },

  /*
   * accounts/removeUserPermissions
   */
  "accounts/removeUserPermissions": function (userId, permissions, group) {
    if (!ReactionCore.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }
    check(userId, String);
    check(permissions, Match.OneOf(String, Array));
    check(group, Match.Optional(String, null));
    this.unblock();
    try {
      return Roles.removeUsersFromRoles(userId, permissions, group);
    } catch (error) {
      ReactionCore.Log.info(error);
      throw new Meteor.Error(403, "Access Denied");
    }
  },

  /*
   * accounts/setUserPermissions
   */
  "accounts/setUserPermissions": function (userId, permissions, group) {
    if (!ReactionCore.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }
    check(userId, String);
    check(permissions, Match.OneOf(String, Array));
    check(group, Match.Optional(String));
    this.unblock();
    try {
      return Roles.setUserRoles(userId, permissions, group);
    } catch (error) {
      return ReactionCore.Log.info(error);
    }
  }
});
