/**
 * Reaction Accounts handlers
 * creates a login type "anonymous"
 * default for all unauthenticated visitors
 */
Accounts.registerLoginHandler(function (options) {
  if (!options.anonymous) {
    return;
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
 * @see: http://docs.meteor.com/#/full/accounts_oncreateuser
 */
Accounts.onCreateUser(function (options, user) {
  const shop = ReactionCore.getCurrentShop();
  const shopId = shop._id;
  let roles = {};
  let additionals = {
    profile: {}
  };
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
      for (let service in user.services) {
        if (user.services[service].email) {
          let email = {
            provides: "default",
            address: user.services[service].email,
            verified: true
          };
          user.emails.push(email);
        }
        if (user.services[service].name) {
          user.username = user.services[service].name;
          additionals.profile.name = user.services[service].name;
        }
        // TODO: For now we have here instagram, twitter and google avatar cases
        // need to make complete list
        if (user.services[service].picture) {
          additionals.profile.picture = user.services[service].picture;
        } else if (user.services[service].profile_image_url_https) {
          additionals.profile.picture = user.services[service].
            dprofile_image_url_https;
        } else if (user.services[service].profile_picture) {
          additionals.profile.picture = user.services[service].profile_picture;
        }
      }
    }
    // clone before adding roles
    let account = Object.assign({}, user, additionals);
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
 * let's remove "anonymous" role, if the login type isn't "anonymous"
 * @param {Object} options - user account creation options
 * @fires "cart/mergeCart" Method
 */
Accounts.onLogin(function (options) {
  // remove anonymous role
  // all users are guest, but anonymous user don't have profile access
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
    ReactionCore.Log.debug("removed anonymous role from user: " +
      options.user._id);

    // do not call `cart/mergeCart` on methodName === `createUser`, because
    // in this case `cart/mergeCart` calls from cart publication
    if (options.methodName === "createUser") return true;

    // onLogin, we want to merge session cart into user cart.
    const cart = ReactionCore.Collections.Cart.findOne({
      userId: options.user._id
    });
    // for a rare use cases
    if (typeof cart !== "object") return false;
    // in current version currentSessionId will be available for anonymous
    // users only, because it is unknown for me how to pass sessionId when user
    // logged in
    const currentSessionId = options.methodArguments &&
      options.methodArguments.length === 1 &&
      options.methodArguments[0].sessionId;

    // changing of workflow status from now happens within `cart/mergeCart`
    return Meteor.call("cart/mergeCart", cart._id, currentSessionId);
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
   * @param {Object} address - address
   * @param {String} [accountUserId] - `account.userId` used by admin to edit
   * users
   * @return {Object} with keys `numberAffected` and `insertedId` if doc was
   * inserted
   */
  "accounts/addressBookAdd": function (address, accountUserId) {
    check(address, ReactionCore.Schemas.Address);
    check(accountUserId, Match.Optional(String));
    // security, check for admin access. We don't need to check every user call
    // here because we are calling `Meteor.userId` from within this Method.
    if (typeof accountUserId === "string") { // if this will not be a String -
      // `check` will not pass it.
      if (!ReactionCore.hasAdminAccess()) {
        throw new Meteor.Error(403, "Access denied");
      }
    }
    this.unblock();

    const userId = accountUserId || Meteor.userId();
    // required default id
    if (!address._id) {
      address._id = Random.id();
    }
    // clean schema
    ReactionCore.Schemas.Address.clean(address);
    // if address got shippment or billing default, we need to update cart
    // addresses accordingly
    if (address.isShippingDefault || address.isBillingDefault) {
      const cart = ReactionCore.Collections.Cart.findOne({ userId: userId });
      // if cart exists
      // First amend the cart,
      if (typeof cart === "object") {
        if (address.isShippingDefault) {
          Meteor.call("cart/setShipmentAddress", cart._id, address);
        }
        if (address.isBillingDefault) {
          Meteor.call("cart/setPaymentAddress", cart._id, address);
        }
      }
      // then change the address that has been affected
      if (address.isShippingDefault) {
        ReactionCore.Collections.Accounts.update({
          "userId": userId,
          "profile.addressBook.isShippingDefault": true
        }, {
          $set: {
            "profile.addressBook.$.isShippingDefault": false
          }
        });
      }
      if (address.isBillingDefault) {
        ReactionCore.Collections.Accounts.update({
          "userId": userId,
          "profile.addressBook.isBillingDefault": true
        }, {
          $set: {
            "profile.addressBook.$.isBillingDefault": false
          }
        });
      }
    }

    return ReactionCore.Collections.Accounts.upsert({
      userId: userId
    }, {
      $set: {
        userId: userId
      },
      $addToSet: {
        "profile.addressBook": address
      }
    });
  },

  /**
   * accounts/addressBookUpdate
   * @description update existing address in user's profile
   * @param {Object} address - address
   * @param {String|null} [accountUserId] - `account.userId` used by admin to
   * edit users
   * @param {shipping|billing} [type] - name of selected address type
   * @return {Number} The number of affected documents
   */
  "accounts/addressBookUpdate": function (address, accountUserId, type) {
    check(address, ReactionCore.Schemas.Address);
    check(accountUserId, Match.OneOf(String, null, undefined));
    check(type, Match.Optional(String));
    // security, check for admin access. We don't need to check every user call
    // here because we are calling `Meteor.userId` from within this Method.
    if (typeof accountUserId === "string") { // if this will not be a String -
      // `check` will not pass it.
      if (!ReactionCore.hasAdminAccess()) {
        throw new Meteor.Error(403, "Access denied");
      }
    }
    this.unblock();

    const userId = accountUserId || Meteor.userId();
    // we need to compare old state of isShippingDefault, isBillingDefault with
    // new state and if it was enabled/disabled reflect this changes in cart
    const account = ReactionCore.Collections.Accounts.findOne({
      userId: userId
    });
    const oldAddress = account.profile.addressBook.find(function (addr) {
      return addr._id === address._id;
    });

    // happens when the user clicked the address in grid. We need to set type
    // to `true`
    if (typeof type === "string") {
      Object.assign(address, { [type]: true });
    }

    if (oldAddress.isShippingDefault !== address.isShippingDefault ||
      oldAddress.isBillingDefault !== address.isBillingDefault) {
      const cart = ReactionCore.Collections.Cart.findOne({ userId: userId });
      // Cart should exist to this moment, so we doesn't need to to verify its
      // existence.
      if (oldAddress.isShippingDefault !== address.isShippingDefault) {
        // if isShippingDefault was changed and now it is `true`
        if (address.isShippingDefault) {
          // we need to add this address to cart
          Meteor.call("cart/setShipmentAddress", cart._id, address);
          // then, if another address was `ShippingDefault`, we need to unset it
          ReactionCore.Collections.Accounts.update({
            "userId": userId,
            "profile.addressBook.isShippingDefault": true
          }, {
            $set: {
              "profile.addressBook.$.isShippingDefault": false
            }
          });
        } else {
          // if new `isShippingDefault` state is false, then we need to remove
          // this address from `cart.shipping`
          Meteor.call("cart/unsetAddresses", address._id, userId, "shipping");
        }
      }

      // the same logic used for billing
      if (oldAddress.isBillingDefault !== address.isBillingDefault) {
        if (address.isBillingDefault) {
          Meteor.call("cart/setPaymentAddress", cart._id, address);
          ReactionCore.Collections.Accounts.update({
            "userId": userId,
            "profile.addressBook.isBillingDefault": true
          }, {
            $set: {
              "profile.addressBook.$.isBillingDefault": false
            }
          });
        } else {
          Meteor.call("cart/unsetAddresses", address._id, userId, "billing");
        }
      }
    }

    return ReactionCore.Collections.Accounts.update({
      "userId": userId,
      "profile.addressBook._id": address._id
    }, {
      $set: {
        "profile.addressBook.$": address
      }
    });
  },

  /**
   * accounts/addressBookRemove
   * @description remove existing address in user's profile
   * @param {String} addressId - address `_id`
   * @param {String} [accountUserId] - `account.userId` used by admin to edit
   * users
   * @return {Number|Object} The number of removed documents or error object
   */
  "accounts/addressBookRemove": function (addressId, accountUserId) {
    check(addressId, String);
    check(accountUserId, Match.Optional(String));
    // security, check for admin access. We don't need to check every user call
    // here because we are calling `Meteor.userId` from within this Method.
    if (typeof accountUserId === "string") { // if this will not be a String -
      // `check` will not pass it.
      if (!ReactionCore.hasAdminAccess()) {
        throw new Meteor.Error(403, "Access denied");
      }
    }
    this.unblock();

    const userId = accountUserId || Meteor.userId();
    // remove this address in cart, if used, before completely removing
    Meteor.call("cart/unsetAddresses", addressId, userId);

    return ReactionCore.Collections.Accounts.update({
      "userId": userId,
      "profile.addressBook._id": addressId
    }, {
      $pull: {
        "profile.addressBook": {
          _id: addressId
        }
      }
    });
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
    // don't send account emails unless email server configured
    if (!process.env.MAIL_URL) {
      ReactionCore.Log.info(`Mail not configured: suppressing invite email output`);
      return true;
    }
    // everything cool? invite user
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
    // don't send account emails unless email server configured
    if (!process.env.MAIL_URL) {
      ReactionCore.Log.info(`Mail not configured: suppressing welcome email output`);
      return true;
    }
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
   * @param {String} userId - userId
   * @param {Array|String} permissions -
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

  /**
   * accounts/setUserPermissions
   * @param {String} userId - userId
   * @param {String|Array} permissions - string/array of permissions
   * @param {String} group - group
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
