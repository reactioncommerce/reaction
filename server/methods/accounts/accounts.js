import _ from "lodash";
import moment from "moment";
import path from "path";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { Accounts, Cart, Media, Shops, Packages } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import { Logger, Reaction } from "/server/api";


/**
 * @summary Returns the name of the geocoder method to use
 * @returns {string} Name of the Geocoder method to use
 */
function getValidator() {
  const shopId = Reaction.getShopId();
  const geoCoders = Packages.find({
    "registry.provides": "addressValidation",
    "settings.addressValidation.enabled": true,
    "shopId": shopId,
    "enabled": true
  }).fetch();

  if (!geoCoders.length) {
    return "";
  }
  let geoCoder;
  // Just one?, use that one
  if (geoCoders.length === 1) {
    geoCoder = geoCoders[0];
  }
  // If there are two, we default to the one that is not the Reaction one
  if (geoCoders.length === 2) {
    geoCoder = _.filter(geoCoders, function (coder) {
      return !_.includes(coder.name, "reaction");
    })[0];
  }

  // check if addressValidation is enabled but the package is disabled, don't do address validation
  let registryName;
  for (const registry of geoCoder.registry) {
    if (registry.provides === "addressValidation") {
      registryName = registry.name;
    }
  }
  const packageKey = registryName.split("/")[2];  // "taxes/addressValidation/{packageKey}"
  if (!_.get(geoCoder.settings[packageKey], "enabled")) {
    return "";
  }

  const methodName = geoCoder.settings.addressValidation.addressValidationMethod;
  return methodName;
}

/**
 * @summary Compare individual fields of address and accumulate errors
 * @param {Object} address - the address provided by the customer
 * @param {Object} validationAddress - address provided by validator
 * @returns {Array} Array of errors (or empty)
 */
function compareAddress(address, validationAddress) {
  const errors = [];
  // first check, if a field is missing (and was present in original address), that means it didn't validate
  // TODO rewrite with just a loop over field names but KISS for now
  if (address.address1 && !validationAddress.address1) {
    errors.push({ address1: "Address line one did not validate" });
  }

  if (address.address2 && validationAddress.address2 && _.trim(_.upperCase(address.address2)) !== _.trim(_.upperCase(validationAddress.address2))) {
    errors.push({ address2: "Address line 2 did not validate" });
  }

  if (!validationAddress.city) {
    errors.push({ city: "City did not validate" });
  }
  if (address.postal && !validationAddress.postal) {
    errors.push({ postal: "Postal did not validate" });
  }

  if (address.region && !validationAddress.region) {
    errors.push({ region: "Region did not validate" });
  }

  if (address.country && !validationAddress.country) {
    errors.push({ country: "Country did not validate" });
  }
  // second check if both fields exist, but they don't match (which almost always happen for certain fields on first time)
  if (validationAddress.address1 && address.address1 && _.trim(_.upperCase(address.address1)) !== _.trim(_.upperCase(validationAddress.address1))) {
    errors.push({ address1: "Address line 1 did not match" });
  }

  if (validationAddress.address2 && address.address2 && (_.upperCase(address.address2) !== _.upperCase(validationAddress.address2))) {
    errors.push({ address2: "Address line 2" });
  }

  if (validationAddress.city && address.city && _.trim(_.upperCase(address.city)) !== _.trim(_.upperCase(validationAddress.city))) {
    errors.push({ city: "City did not match" });
  }

  if (validationAddress.postal && address.postal && _.trim(_.upperCase(address.postal)) !== _.trim(_.upperCase(validationAddress.postal))) {
    errors.push({ postal: "Postal Code did not match" });
  }

  if (validationAddress.region && address.region && _.trim(_.upperCase(address.region)) !== _.trim(_.upperCase(validationAddress.region))) {
    errors.push({ region: "Region did not match" });
  }

  if (validationAddress.country && address.country && _.upperCase(address.country) !== _.upperCase(validationAddress.country)) {
    errors.push({ country: "Country did not match" });
  }
  return errors;
}

/**
 * @summary Validates an address, and if fails returns details of issues
 * @param {Object} address - The address object to validate
 * @returns {{validated: boolean, address: *}} - The results of the validation
 */
function validateAddress(address) {
  check(address, Object);
  let validated = true;
  let validationErrors;
  let validatedAddress = address;
  let formErrors;
  Schemas.Address.clean(address);
  const validator = getValidator();
  if (validator) {
    const validationResult = Meteor.call(validator, address);
    validatedAddress = validationResult.validatedAddress;
    formErrors = validationResult.errors;
    if (validatedAddress) {
      validationErrors = compareAddress(address, validatedAddress);
      if (validationErrors.length || formErrors.length) {
        validated = false;
      }
    } else {
      // No address, fail validation
      validated = false;
    }
  }
  const validationResults = { validated, fieldErrors: validationErrors, formErrors, validatedAddress };
  return validationResults;
}

/**
 * Reaction Account Methods
 */
Meteor.methods({
  "accounts/validateAddress": validateAddress,
  /*
   * check if current user has password
   */
  "accounts/currentUserHasPassword": function () {
    const user = Meteor.users.findOne(Meteor.userId());
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
    check(address, Schemas.Address);
    check(accountUserId, Match.Optional(String));
    // security, check for admin access. We don't need to check every user call
    // here because we are calling `Meteor.userId` from within this Method.
    if (typeof accountUserId === "string") { // if this will not be a String -
      // `check` will not pass it.
      if (!Reaction.hasAdminAccess()) {
        throw new Meteor.Error(403, "Access denied");
      }
    }
    this.unblock();

    const userId = accountUserId || Meteor.userId();
    // required default id
    if (!address._id) {
      address._id = Random.id();
    }
    // if address got shippment or billing default, we need to update cart
    // addresses accordingly
    if (address.isShippingDefault || address.isBillingDefault) {
      const cart = Cart.findOne({ userId: userId });
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
        Accounts.update({
          "userId": userId,
          "profile.addressBook.isShippingDefault": true
        }, {
          $set: {
            "profile.addressBook.$.isShippingDefault": false
          }
        });
      }
      if (address.isBillingDefault) {
        Accounts.update({
          "userId": userId,
          "profile.addressBook.isBillingDefault": true
        }, {
          $set: {
            "profile.addressBook.$.isBillingDefault": false
          }
        });
      }
    }

    return Accounts.upsert({
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
    check(address, Schemas.Address);
    check(accountUserId, Match.OneOf(String, null, undefined));
    check(type, Match.Optional(String));
    // security, check for admin access. We don't need to check every user call
    // here because we are calling `Meteor.userId` from within this Method.
    if (typeof accountUserId === "string") { // if this will not be a String -
      // `check` will not pass it.
      if (!Reaction.hasAdminAccess()) {
        throw new Meteor.Error(403, "Access denied");
      }
    }
    this.unblock();

    const userId = accountUserId || Meteor.userId();
    // we need to compare old state of isShippingDefault, isBillingDefault with
    // new state and if it was enabled/disabled reflect this changes in cart
    const account = Accounts.findOne({
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

    // We want the cart addresses to be updated when current default address
    // (shipping or Billing) are different than the previous one, but also
    // when the current default address(ship or bill) gets edited(so Current and Previous default are the same).
    // This check can be simplified to :
    if  (address.isShippingDefault || address.isBillingDefault ||
         oldAddress.isShippingDefault || address.isBillingDefault) {
      const cart = Cart.findOne({ userId: userId });
      // Cart should exist to this moment, so we doesn't need to to verify its
      // existence.
      if (oldAddress.isShippingDefault !== address.isShippingDefault) {
        // if isShippingDefault was changed and now it is `true`
        if (address.isShippingDefault) {
          // we need to add this address to cart
          Meteor.call("cart/setShipmentAddress", cart._id, address);
          // then, if another address was `ShippingDefault`, we need to unset it
          Accounts.update({
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
      } else if (address.isShippingDefault && oldAddress.isShippingDefault) {
        // If current Shipping Address was edited but not changed update it to cart too
        Meteor.call("cart/setShipmentAddress", cart._id, address);
      }

      // the same logic used for billing
      if (oldAddress.isBillingDefault !== address.isBillingDefault) {
        if (address.isBillingDefault) {
          Meteor.call("cart/setPaymentAddress", cart._id, address);
          Accounts.update({
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
      } else if (address.isBillingDefault && oldAddress.isBillingDefault) {
        // If current Billing Address was edited but not changed update it to cart too
        Meteor.call("cart/setPaymentAddress", cart._id, address);
      }
    }

    return Accounts.update({
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
      if (!Reaction.hasAdminAccess()) {
        throw new Meteor.Error(403, "Access denied");
      }
    }
    this.unblock();

    const userId = accountUserId || Meteor.userId();
    // remove this address in cart, if used, before completely removing
    Meteor.call("cart/unsetAddresses", addressId, userId);

    return Accounts.update({
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
    check(shopId, String);
    check(email, String);
    check(name, String);

    this.unblock();

    const shop = Shops.findOne(shopId);

    if (!shop) {
      const msg = `accounts/inviteShopMember - Shop ${shopId} not found`;
      Logger.error(msg);
      throw new Meteor.Error("shop-not-found", msg);
    }

    if (!Reaction.hasPermission("reaction-accounts", this.userId, shopId)) {
      Logger.error(`User ${this.userId} does not have reaction-accounts permissions`);
      throw new Meteor.Error("access-denied", "Access denied");
    }

    const currentUser = Meteor.users.findOne(this.userId);

    let currentUserName;

    if (currentUser) {
      if (currentUser.profile) {
        currentUserName = currentUser.profile.name || currentUser.username;
      } else {
        currentUserName = currentUser.username;
      }
    } else {
      currentUserName = "Admin";
    }

    const user = Meteor.users.findOne({
      "emails.address": email
    });

    if (!user) {
      const userId = MeteorAccounts.createUser({
        email: email,
        username: name
      });

      const newUser = Meteor.users.findOne(userId);

      if (!newUser) {
        throw new Error("Can't find user");
      }

      const token = Random.id();

      Meteor.users.update(userId, {
        $set: {
          "services.password.reset": { token, email, when: new Date() }
        }
      });

      // Get shop logo, if available. If not, use default logo from file-system
      let emailLogo;
      if (Array.isArray(shop.brandAssets)) {
        const brandAsset = _.find(shop.brandAssets, (asset) => asset.type === "navbarBrandImage");
        const mediaId = Media.findOne(brandAsset.mediaId);
        emailLogo = path.join(Meteor.absoluteUrl(), mediaId.url());
      } else {
        emailLogo = Meteor.absoluteUrl() + "resources/email-templates/shop-logo.png";
      }

      const dataForEmail = {
        // Shop Data
        shop: shop,
        contactEmail: shop.emails[0].address,
        homepage: Meteor.absoluteUrl(),
        emailLogo: emailLogo,
        copyrightDate: moment().format("YYYY"),
        legalName: shop.addressBook[0].company,
        physicalAddress: {
          address: shop.addressBook[0].address1 + " " + shop.addressBook[0].address2,
          city: shop.addressBook[0].city,
          region: shop.addressBook[0].region,
          postal: shop.addressBook[0].postal
        },
        shopName: shop.name,
        socialLinks: {
          display: true,
          facebook: {
            display: true,
            icon: Meteor.absoluteUrl() + "resources/email-templates/facebook-icon.png",
            link: "https://www.facebook.com"
          },
          googlePlus: {
            display: true,
            icon: Meteor.absoluteUrl() + "resources/email-templates/google-plus-icon.png",
            link: "https://plus.google.com"
          },
          twitter: {
            display: true,
            icon: Meteor.absoluteUrl() + "resources/email-templates/twitter-icon.png",
            link: "https://www.twitter.com"
          }
        },
        // Account Data
        user: Meteor.user(),
        currentUserName,
        invitedUserName: name,
        url: MeteorAccounts.urls.enrollAccount(token)
      };

      // Compile Email with SSR
      const tpl = "accounts/inviteShopMember";
      const subject = "accounts/inviteShopMember/subject";
      SSR.compileTemplate(tpl, Reaction.Email.getTemplate(tpl));
      SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl));

      Reaction.Email.send({
        to: email,
        from: `${shop.name} <${shop.emails[0].address}>`,
        subject: SSR.render(subject, dataForEmail),
        html: SSR.render(tpl, dataForEmail)
      });
    } else {
      Reaction.Email.send({
        to: email,
        from: `${shop.name} <${shop.emails[0].address}>`,
        subject: SSR.render(subject, dataForEmail),
        html: SSR.render(tpl, dataForEmail)
      });
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

    const user = Accounts.findOne(userId);
    const shop = Shops.findOne(shopId);

    // Get shop logo, if available. If not, use default logo from file-system
    let emailLogo;
    if (Array.isArray(shop.brandAssets)) {
      const brandAsset = _.find(shop.brandAssets, (asset) => asset.type === "navbarBrandImage");
      const mediaId = Media.findOne(brandAsset.mediaId);
      emailLogo = path.join(Meteor.absoluteUrl(), mediaId.url());
    } else {
      emailLogo = Meteor.absoluteUrl() + "resources/email-templates/shop-logo.png";
    }

    const dataForEmail = {
      // Shop Data
      shop: shop,
      contactEmail: shop.emails[0].address,
      homepage: Meteor.absoluteUrl(),
      emailLogo: emailLogo,
      copyrightDate: moment().format("YYYY"),
      legalName: shop.addressBook[0].company,
      physicalAddress: {
        address: shop.addressBook[0].address1 + " " + shop.addressBook[0].address2,
        city: shop.addressBook[0].city,
        region: shop.addressBook[0].region,
        postal: shop.addressBook[0].postal
      },
      shopName: shop.name,
      socialLinks: {
        display: true,
        facebook: {
          display: true,
          icon: Meteor.absoluteUrl() + "resources/email-templates/facebook-icon.png",
          link: "https://www.facebook.com"
        },
        googlePlus: {
          display: true,
          icon: Meteor.absoluteUrl() + "resources/email-templates/google-plus-icon.png",
          link: "https://plus.google.com"
        },
        twitter: {
          display: true,
          icon: Meteor.absoluteUrl() + "resources/email-templates/twitter-icon.png",
          link: "https://www.twitter.com"
        }
      },
      // Account Data
      user: Meteor.user()
    };

    // anonymous users arent welcome here
    if (!user.emails || !user.emails.length > 0) {
      return true;
    }

    const userEmail = user.emails[0].address;

    let shopEmail;
    // provide some defaults for missing shop email.
    if (!shop.emails) {
      shopEmail = `${shop.name}@localhost`;
      Logger.debug(`Shop email address not configured. Using ${shopEmail}`);
    } else {
      shopEmail = shop.emails[0].address;
    }

    const tpl = "accounts/sendWelcomeEmail";
    const subject = "accounts/sendWelcomeEmail/subject";
    SSR.compileTemplate(tpl, Reaction.Email.getTemplate(tpl));
    SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl));

    Reaction.Email.send({
      to: userEmail,
      from: `${shop.name} <${shopEmail}>`,
      subject: SSR.render(subject, dataForEmail),
      html: SSR.render(tpl, dataForEmail)
    });

    return true;
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
    if (!Reaction.hasPermission("reaction-accounts", Meteor.userId(), group)) {
      throw new Meteor.Error(403, "Access denied");
    }
    check(userId, Match.OneOf(String, Array));
    check(permissions, Match.OneOf(String, Array));
    check(group, Match.Optional(String));
    this.unblock();
    try {
      return Roles.addUsersToRoles(userId, permissions, group);
    } catch (error) {
      return Logger.error(error);
    }
  },

  /*
   * accounts/removeUserPermissions
   */
  "accounts/removeUserPermissions": function (userId, permissions, group) {
    if (!Reaction.hasPermission("reaction-accounts", Meteor.userId(), group)) {
      throw new Meteor.Error(403, "Access denied");
    }
    check(userId, String);
    check(permissions, Match.OneOf(String, Array));
    check(group, Match.Optional(String, null));
    this.unblock();

    try {
      return Roles.removeUsersFromRoles(userId, permissions, group);
    } catch (error) {
      Logger.error(error);
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
    if (!Reaction.hasPermission("reaction-accounts", Meteor.userId(), group)) {
      throw new Meteor.Error(403, "Access denied");
    }
    check(userId, String);
    check(permissions, Match.OneOf(String, Array));
    check(group, Match.Optional(String));
    this.unblock();
    try {
      return Roles.setUserRoles(userId, permissions, group);
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }
});
