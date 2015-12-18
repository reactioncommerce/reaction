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

// a generator function
// for services extraction
function services(obj) {
  if (!obj) return [];
  for (let key of Object.keys(obj)) {
    return [key, obj[key]];
  }
}
/**
 * Accounts.onCreateUser event
 * adding either a guest or anonymous role to the user on create
 * adds Accounts record for reaction user profiles
 * we clone the user into accounts, as the user collection is
 * only to be used for authentication.
 *
 * see: http://docs.meteor.com/#/full/accounts_oncreateuser
 */
Accounts.onCreateUser(function (options, user) {
  let shop = ReactionCore.getCurrentShop();
  let shopId = ReactionCore.getShopId();
  let roles = {};
  if (!user.emails) user.emails = [];
  // init default user roles
  // we won't create users unless we have a shop.
  if (shop) {
    // if we don't have user.services we're an anonymous user
    if (!user.services) {
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
    // clone before adding roles
    let account = _.clone(user);
    account.userId = user._id;
    ReactionCore.Collections.Accounts.insert(account);
    // send welcome email to new users
    Meteor.call("accounts/sendWelcomeEmail", shopId, user._id);
    // assign default user roles
    user.roles = roles;
    return user;
  }
});

/**
 * Accounts.onLogin event
 * automatically push checkoutLogin when users login.
 * let's remove "anonymous" role, if the login type isn't "anonymous"
 * @param {Object} options - user account creation options
 * @returns {Object} returns workflow/pushCartWorkflow results
 */
Accounts.onLogin(function (options) {
  // remove anonymous role
  // all users are guest, but anonymous user don' t have profile access
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
   * @return {Object} with keys `numberAffected` and `insertedId` if doc was
   * inserted
   */
  "accounts/addressBookAdd": function (doc, accountId) {
    check(doc, ReactionCore.Schemas.Address);
    check(accountId, String);
    // security, check user ownership
    if (!ReactionCore.hasAdminAccess()) {
      if (accountId !== Meteor.userId()) {
        throw new Meteor.Error(403, "Access denied");
      }
    }
    this.unblock();
    // required default id
    if (!doc._id) {
      doc._id = Random.id();
    }
    // clean schema
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

    return ReactionCore.Collections.Accounts.upsert(accountId, {
      $set: {
        userId: accountId
      },
      $addToSet: {
        "profile.addressBook": doc
      }
    });
  },

  /**
   * accounts/addressBookUpdate
   * @description update existing address in user's profile
   * @param {Object} doc - address
   * @param {String} accountId - `account._id` which is need to be updated
   * @return {Number} The number of affected documents
   */
  "accounts/addressBookUpdate": function (doc, accountId) {
    check(doc, ReactionCore.Schemas.Address);
    check(accountId, String);
    // security, check user ownership
    if (!ReactionCore.hasAdminAccess()) {
      if (accountId !== Meteor.userId()) {
        throw new Meteor.Error(403, "Access denied");
      }
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

    return ReactionCore.Collections.Accounts.update({
      "_id": accountId,
      "profile.addressBook._id": doc._id
    }, {
      $set: {
        "profile.addressBook.$": doc
      }
    });
  },

  /**
   * accounts/addressBookRemove
   * @description remove existing address in user's profile
   * @param {String} addressId - address._id
   * @param {String} accountId - `account._id` which is need to be updated
   * @return {Number|Object} The number of removed documents or error object
   */
  "accounts/addressBookRemove": function (addressId, accountId) {
    check(addressId, String);
    check(accountId, String);
    // security, check user ownership
    if (!ReactionCore.hasAdminAccess()) {
      if (accountId !== Meteor.userId()) {
        throw new Meteor.Error(403, "Access denied");
      }
    }
    this.unblock();

    // remove this address in cart, if used before completely removing
    const result = Meteor.call("cart/unsetAddresses", addressId, accountId);

    if (typeof result === "number") {
      return ReactionCore.Collections.Accounts.update({
        "_id": accountId,
        "profile.addressBook._id": addressId
      }, {
        $pull: {
          "profile.addressBook": {
            _id: addressId
          }
        }
      });
    }
    // error
    ReactionCore.Log.warn(result);
    return result;
  },

  /**
   * accounts/inviteShopMember
   * invite new admin users
   * (not consumers) to secure access in the dashboard
   * to permissions as specified in packages/roles
   * @param {String} shopId - shop to invite user
   * @param {String} email - email of invitee
   * @param {String} name - name to address email
   * @returns {Boolean} returns true
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
    shop = ReactionCore.Collections.Shops.findOne(shopId);

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
        SSR.compileTemplate("accounts/inviteShopMember", ReactionEmailTemplate("accounts/inviteShopMember"));
        try {
          return Email.send({
            to: email,
            from: `${shop.name} <${shop.emails[0].address}>`,
            subject: `You have been invited to join ${shop.name}`,
            html: SSR.render("accounts/inviteShopMember", {
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
        SSR.compileTemplate("accounts/inviteShopMember", ReactionEmailTemplate("accounts/inviteShopMember"));
        try {
          return Email.send({
            to: email,
            from: `${shop.name} <${shop.emails[0].address}>`,
            subject: `You have been invited to join the ${shop.name}`,
            html: SSR.render("accounts/inviteShopMember", {
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
   * accounts/sendWelcomeEmail
   * send an email to consumers on sign up
   * @param {String} shopId - shopId of new User
   * @param {String} userId - new userId to welcome
   * @returns {Boolean} returns boolean
   */
  "accounts/sendWelcomeEmail": function (shopId, userId) {
    check(shopId, String);
    check(userId, String);
    this.unblock();
    const user = ReactionCore.Collections.Accounts.findOne(userId);
    const shop = ReactionCore.Collections.Shops.findOne(shopId);
    let shopEmail;

    // anonymous users arent welcome here
    if (!user.emails || !user.emails.length > 0) {
      return true;
    }

    let userEmail = user.emails[0].address;

    // provide some defaults for missing shop email.
    if (!shop.emails) {
      shopEmail = `${shop.name}@localhost`;
      ReactionCore.Log.debug(`Shop email address not configured. Using ${shopEmail}`);
    } else {
      shopEmail = shop.emails[0].address;
    }

    // configure email
    ReactionCore.configureMailUrl();
    // fetch and send templates
    SSR.compileTemplate("accounts/sendWelcomeEmail", ReactionEmailTemplate("accounts/sendWelcomeEmail"));
    try {
      return Email.send({
        to: userEmail,
        from: `${shop.name} <${shopEmail}>`,
        subject: `Welcome to ${shop.name}!`,
        html: SSR.render("accounts/sendWelcomeEmail", {
          homepage: Meteor.absoluteUrl(),
          shop: shop,
          user: Meteor.user()
        })
      });
    } catch (e) {
      ReactionCore.Log.warn("Unable to send email, check configuration and port.", e);
    }
  },
  /**
   * accounts/addUserPermissions
   * @params {String} userId - userId
   * @params {Array|String} permissions -
   *               Name of role/permission.  If array, users
   *               returned will have at least one of the roles
   *               specified but need not have _all_ roles.
   * @params {String} [group] Optional name of group to restrict roles to.
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

  /**
   * accounts/setUserPermissions
   * @params {String} userId - userId
   * @params {String|Array} permissions - string/array of permissions
   * @params {String} groups - group
   * @returns {Boolean} returns Roles.setUserRoles result
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
      ReactionCore.Log.info(error);
      return error;
    }
  }
});
