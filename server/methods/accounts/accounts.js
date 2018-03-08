import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { SSR } from "meteor/meteorhacks:ssr";
import { Accounts, Cart, Groups, Shops, Packages } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import { Hooks, Logger, Reaction } from "/server/api";
import { sendUpdatedVerificationEmail } from "/server/api/core/accounts";

/**
 * @file Extends Meteor's {@link https://github.com/meteor/meteor/tree/master/packages/accounts-base Accounts-Base}
 * with methods for Reaction-specific behavior and user interaction. Run these methods using: `Meteor.call()`
 * @example Meteor.call("accounts/verifyAccount", email, token)
 * @namespace Methods/Accounts
 */

/**
 * @name accounts/verifyAccount
 * @memberof Methods/Accounts
 * @method
 * @summary Verifies the email address in account document (if user verification in users collection was successful already)
 * @example Meteor.call("accounts/verifyAccount")
 * @returns {Boolean} - returns true on success
 */
export function verifyAccount() {
  if (!this.userId) {
    // not logged in
    return;
  }

  const user = Meteor.user();
  const addresses = user.emails
    .filter((email) => email.verified)
    .map((email) => email.address);
  const result = Accounts.update({
    "userId": this.userId,
    "emails.address": { $in: addresses }
  }, {
    $set: {
      "emails.$.verified": true
    }
  });

  if (result) {
    Hooks.Events.run(
      "afterAccountsUpdate",
      this.userId, {
        accountId: Accounts.findOne({ userId: this.userId })._id,
        updatedFields: ["emails"]
      }
    );
  }
  return result;
}

/**
 * @name accounts/updateEmailAddress
 * @memberof Methods/Accounts
 * @method
 * @summary Update a user's email address
 * @param {String} email - user email
 * @returns {Boolean} - return True on success
 */
export function updateEmailAddress(email) {
  check(email, String);
  const user = Meteor.user();

  // Add email to user account
  MeteorAccounts.addEmail(user._id, email);

  return true;
}

/**
 * @name accounts/removeEmailAddress
 * @memberof Methods/Accounts
 * @method
 * @summary Remove a user's email address.
 * @param {String} email - user email.
 * @returns {Boolean} - returns boolean.
 */
export function removeEmailAddress(email) {
  check(email, String);

  const user = Meteor.user();

  // Remove email address from user
  MeteorAccounts.removeEmail(user._id, email);

  // Verify new address
  sendUpdatedVerificationEmail(user._id);

  // Sync users and accounts collections
  syncUsersAndAccounts();

  return true;
}

/**
 * @name accounts/syncUsersAndAccounts
 * @memberof Methods/Accounts
 * @method
 * @summary Syncs emails associated with a user profile between the Users and Accounts collections.
 * @returns {Boolean} - returns boolean.
 */
export function syncUsersAndAccounts() {
  const user = Meteor.user();

  Accounts.update({
    _id: user._id
  }, {
    $set: {
      emails: [
        user.emails[0]
      ]
    }
  });
  Hooks.Events.run("afterAccountsUpdate", user._id, {
    accountId: user._id,
    updatedFields: ["emails"]
  });

  return true;
}

/**
 * @name getValidator
 * @summary Returns the name of the geocoder method to use
 * @returns {string} Name of the Geocoder method to use
 * @private
 */
function getValidator() {
  const shopId = Reaction.getShopId();
  const geoCoders = Packages.find({
    "registry.provides": "addressValidation",
    "settings.addressValidation.enabled": true,
    shopId,
    "enabled": true
  }).fetch();

  if (!geoCoders.length) {
    return "";
  }
  let geoCoder;
  // Just one?, use that one
  if (geoCoders.length === 1) {
    [geoCoder] = geoCoders;
  }
  // If there are two, we default to the one that is not the Reaction one
  if (geoCoders.length === 2) {
    geoCoder = geoCoders.find((coder) => !coder.name.includes("reaction"));
  }

  // check if addressValidation is enabled but the package is disabled, don't do address validation
  let registryName;
  for (const registry of geoCoder.registry) {
    if (registry.provides && registry.provides.includes("addressValidation")) {
      registryName = registry.name;
    }
  }
  const packageKey = registryName.split("/")[2]; // "taxes/addressValidation/{packageKey}"
  if (!_.get(geoCoder.settings[packageKey], "enabled")) {
    return "";
  }

  const methodName = geoCoder.settings.addressValidation.addressValidationMethod;
  return methodName;
}

/**
 * @name compareAddress
 * @summary Compare individual fields of address and accumulate errors
 * @param {Object} address - the address provided by the customer
 * @param {Object} validationAddress - address provided by validator
 * @returns {Object} An object with an array of errors per field
 * @private
 */
function compareAddress(address, validationAddress) {
  const errors = {
    address1: [],
    address2: [],
    city: [],
    postal: [],
    region: [],
    country: [],
    totalErrors: 0
  };
  // first check, if a field is missing (and was present in original address), that means it didn't validate
  // TODO rewrite with just a loop over field names but KISS for now
  if (address.address1 && !validationAddress.address1) {
    errors.address1.push("Address line one did not validate");
    errors.totalErrors += 1;
  }

  if (address.address2 && validationAddress.address2 && _.trim(_.upperCase(address.address2)) !== _.trim(_.upperCase(validationAddress.address2))) {
    errors.address2.push("Address line 2 did not validate");
    errors.totalErrors += 1;
  }

  if (!validationAddress.city) {
    errors.city.push("City did not validate");
    errors.totalErrors += 1;
  }
  if (address.postal && !validationAddress.postal) {
    errors.postal.push("Postal did not validate");
    errors.totalErrors += 1;
  }

  if (address.region && !validationAddress.region) {
    errors.region.push("Region did not validate");
    errors.totalErrors += 1;
  }

  if (address.country && !validationAddress.country) {
    errors.country.push("Country did not validate");
    errors.totalErrors += 1;
  }
  // second check if both fields exist, but they don't match (which almost always happen for certain fields on first time)
  if (validationAddress.address1 && address.address1 && _.trim(_.upperCase(address.address1)) !== _.trim(_.upperCase(validationAddress.address1))) {
    errors.address1.push({ address1: "Address line 1 did not match" });
    errors.totalErrors += 1;
  }

  if (validationAddress.address2 && address.address2 && (_.upperCase(address.address2) !== _.upperCase(validationAddress.address2))) {
    errors.address2.push("Address line 2 did not match");
    errors.totalErrors += 1;
  }

  if (validationAddress.city && address.city && _.trim(_.upperCase(address.city)) !== _.trim(_.upperCase(validationAddress.city))) {
    errors.city.push("City did not match");
    errors.totalErrors += 1;
  }

  if (validationAddress.postal && address.postal && _.trim(_.upperCase(address.postal)) !== _.trim(_.upperCase(validationAddress.postal))) {
    errors.postal.push("Postal Code did not match");
    errors.totalErrors += 1;
  }

  if (validationAddress.region && address.region && _.trim(_.upperCase(address.region)) !== _.trim(_.upperCase(validationAddress.region))) {
    errors.region.push("Region did not match");
    errors.totalErrors += 1;
  }

  if (validationAddress.country && address.country && _.upperCase(address.country) !== _.upperCase(validationAddress.country)) {
    errors.country.push("Country did not match");
    errors.totalErrors += 1;
  }
  return errors;
}

/**
 * @name accounts/validateAddress
 * @memberof Methods/Accounts
 * @method
 * @summary Validates an address, and if fails returns details of issues
 * @param {Object} address - The address object to validate
 * @returns {{validated: boolean, address: *}} - The results of the validation
 */
export function validateAddress(address) {
  Schemas.Address.clean(address, { mutate: true });
  Schemas.Address.validate(address);

  let validated = true;
  let validationErrors;
  let validatedAddress = address;
  let formErrors;
  const validator = getValidator();
  if (validator) {
    const validationResult = Meteor.call(validator, address);
    ({ validatedAddress } = validationResult);
    formErrors = validationResult.errors;
    if (validatedAddress) {
      validationErrors = compareAddress(address, validatedAddress);
      if (validationErrors.totalErrors || formErrors.length) {
        validated = false;
        validatedAddress.failedValidation = true;
      }
    } else {
      // No address, fail validation
      validated = false;
      validatedAddress = {
        failedValidation: true
      };
    }
  }
  const validationResults = { validated, fieldErrors: validationErrors, formErrors, validatedAddress };
  return validationResults;
}

/**
 * @name currentUserHasPassword
 * @summary Check if current user has password
 * @returns {Boolean} True if current user has password
 * @private
 */
function currentUserHasPassword() {
  const user = Meteor.users.findOne(Meteor.userId());
  return !!user.services.password;
}

/**
 * @name accounts/addressBookAdd
 * @memberof Methods/Accounts
 * @method
 * @summary Add new addresses to an account
 * @example Meteor.call("accounts/addressBookAdd", address, callBackFunction(error, result))
 * @param {Object} address - address
 * @param {String} [accountUserId] - `account.userId` used by admin to edit users
 * @return {Object} with keys `numberAffected` and `insertedId` if doc was inserted
 */
export function addressBookAdd(address, accountUserId) {
  Schemas.Address.validate(address);
  check(accountUserId, Match.Optional(String));
  // security, check for admin access. We don't need to check every user call
  // here because we are calling `Meteor.userId` from within this Method.
  if (typeof accountUserId === "string") { // if this will not be a String -
    // `check` will not pass it.
    if (!Reaction.hasAdminAccess()) {
      throw new Meteor.Error("access-denied", "Access denied");
    }
  }
  this.unblock();

  const userId = accountUserId || Meteor.userId();
  const account = Accounts.findOne({
    userId
  });
  // required default id
  if (!address._id) {
    address._id = Random.id();
  }
  // if address got shippment or billing default, we need to update cart
  // addresses accordingly
  if (address.isShippingDefault || address.isBillingDefault) {
    const cart = Cart.findOne({ userId });
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
        userId,
        "profile.addressBook.isShippingDefault": true
      }, {
        $set: {
          "profile.addressBook.$.isShippingDefault": false
        }
      });
      Hooks.Events.run("afterAccountsUpdate", Meteor.userId(), {
        accountId: account._id,
        updatedFields: ["isShippingDefault"]
      });
    }
    if (address.isBillingDefault) {
      Accounts.update({
        userId,
        "profile.addressBook.isBillingDefault": true
      }, {
        $set: {
          "profile.addressBook.$.isBillingDefault": false
        }
      });
      Hooks.Events.run("afterAccountsUpdate", Meteor.userId(), {
        accountId: account._id,
        updatedFields: ["isBillingDefault"]
      });
    }
  }

  const userUpdateQuery = {
    $set: {
      "profile.addressBook": address
    }
  };
  const accountsUpdateQuery = {
    $set: {
      userId
    },
    $addToSet: {
      "profile.addressBook": address
    }
  };

  if (!account.name || _.get(account, "profile.addressBook.length", 0) === 0) {
    userUpdateQuery.$set.name = address.fullName;
    accountsUpdateQuery.$set.name = address.fullName;
  }

  Meteor.users.update(Meteor.userId(), userUpdateQuery);

  return Accounts.upsert({
    userId
  }, accountsUpdateQuery);
}

/**
 * @name accounts/addressBookUpdate
 * @memberof Methods/Accounts
 * @method
 * @summary Update existing address in user's profile
 * @param {Object} address - address
 * @param {String|null} [accountUserId] - `account.userId` used by admin to edit users
 * @param {shipping|billing} [type] - name of selected address type
 * @return {Number} The number of affected documents
 */
export function addressBookUpdate(address, accountUserId, type) {
  Schemas.Address.validate(address);
  check(accountUserId, Match.OneOf(String, null, undefined));
  check(type, Match.Optional(String));
  // security, check for admin access. We don't need to check every user call
  // here because we are calling `Meteor.userId` from within this Method.
  if (typeof accountUserId === "string") { // if this will not be a String -
    // `check` will not pass it.
    if (!Reaction.hasAdminAccess()) {
      throw new Meteor.Error("access-denied", "Access denied");
    }
  }
  this.unblock();

  // If no userId is provided, use the current user
  const userId = accountUserId || Meteor.userId();
  // Find old state of isShippingDefault & isBillingDefault to compare and reflect in cart
  const account = Accounts.findOne({ userId });
  const oldAddress = (account.profile.addressBook || []).find((addr) => addr._id === address._id);

  if (!oldAddress) throw new Meteor.Error("not-found", `No existing address found with ID ${address._id}`);

  // Set new address to be default for `type`
  if (typeof type === "string") {
    Object.assign(address, { [type]: true });
  }

  // We want the cart addresses to be updated when current default address
  // (shipping or Billing) are different than the previous one, but also
  // when the current default address(ship or bill) gets edited(so Current and Previous default are the same).
  // This check can be simplified to :
  if (address.isShippingDefault || address.isBillingDefault ||
    oldAddress.isShippingDefault || oldAddress.isBillingDefault) {
    // Find user cart
    // Cart should exist to this moment, so we don't need to to verify its existence.
    const cart = Cart.findOne({ userId });

    // If isShippingDefault address has changed
    if (oldAddress.isShippingDefault !== address.isShippingDefault) {
      // Update the cart to use new default shipping address
      if (address.isShippingDefault) {
        Meteor.call("cart/setShipmentAddress", cart._id, address);
      } else {
        // If the new address is not the shipping default, remove it from the cart
        Meteor.call("cart/unsetAddresses", address._id, userId, "shipping");
      }
    } else if (address.isShippingDefault && oldAddress.isShippingDefault) {
      // If shipping address was edited, but isShippingDefault status not changed, update the cart address
      Meteor.call("cart/setShipmentAddress", cart._id, address);
    }

    // If isBillingDefault address has changed
    if (oldAddress.isBillingDefault !== address.isBillingDefault) {
      // Update the cart to use new default billing address
      if (address.isBillingDefault) {
        Meteor.call("cart/setPaymentAddress", cart._id, address);
      } else {
        // If the new address is not the shipping default, remove it from the cart
        Meteor.call("cart/unsetAddresses", address._id, userId, "billing");
      }
    } else if (address.isBillingDefault && oldAddress.isBillingDefault) {
      // If shipping address was edited, but isShippingDefault status not changed, update the cart address
      Meteor.call("cart/setPaymentAddress", cart._id, address);
    }
  }

  // Update all other to set the default type to false
  account.profile.addressBook.forEach((addr) => {
    if (addr._id === address._id) {
      Object.assign(addr, address);
    } else if (typeof type === "string") {
      Object.assign(addr, { [type]: false });
    }
  });

  // TODO: revisit why we update Meteor.users differently than accounts
  // We could possibly remove the whole `userUpdateQuery` variable
  // and update Meteor.users with the accountsUpdateQuery data
  const userUpdateQuery = {
    $set: {
      "profile.addressBook": address
    }
  };

  const accountsUpdateQuery = {
    $set: {
      "profile.addressBook": account.profile.addressBook
    }
  };
  // update the name when there is no name or the user updated his only shipping address
  if (!account.name || _.get(account, "profile.addressBook.length", 0) <= 1) {
    userUpdateQuery.$set.name = address.fullName;
    accountsUpdateQuery.$set.name = address.fullName;
  }

  // Update the Meteor.users collection with new address info
  Meteor.users.update(Meteor.userId(), userUpdateQuery);

  // Update the Reaction Accounts collection with new address info
  const updatedAccount = Accounts.update({
    userId
  }, accountsUpdateQuery);

  // Create an array which contains all fields that have changed
  // This is used for search, to determine if we need to re-index
  const updatedFields = [];
  Object.keys(address).forEach((key) => {
    if (address[key] !== oldAddress[key]) {
      updatedFields.push(key);
    }
  });

  // Run afterAccountsUpdate hook to update Accounts Search
  Hooks.Events.run("afterAccountsUpdate", Meteor.userId(), {
    accountId: account._id,
    updatedFields
  });

  return updatedAccount;
}

/**
 * @name accounts/addressBookRemove
 * @memberof Methods/Accounts
 * @method
 * @summary Remove existing address in user's profile
 * @param {String} addressId - address `_id`
 * @param {String} [accountUserId] - `account.userId` used by admin to edit users
 * @return {Number|Object} The number of removed documents or error object
 */
export function addressBookRemove(addressId, accountUserId) {
  check(addressId, String);
  check(accountUserId, Match.Optional(String));
  // security, check for admin access. We don't need to check every user call
  // here because we are calling `Meteor.userId` from within this Method.
  if (typeof accountUserId === "string") { // if this will not be a String -
    // `check` will not pass it.
    if (!Reaction.hasAdminAccess()) {
      throw new Meteor.Error("access-denied", "Access denied");
    }
  }
  this.unblock();

  const userId = accountUserId || Meteor.userId();
  const account = Accounts.findOne({ userId });
  // remove this address in cart, if used, before completely removing
  Meteor.call("cart/unsetAddresses", addressId, userId);

  const updatedAccount = Accounts.update({
    userId,
    "profile.addressBook._id": addressId
  }, {
    $pull: {
      "profile.addressBook": {
        _id: addressId
      }
    }
  }, { bypassCollection2: true });

  // forceIndex when removing an address
  Hooks.Events.run("afterAccountsUpdate", Meteor.userId(), {
    accountId: account._id,
    updatedFields: ["forceIndex"]
  });

  return updatedAccount;
}

/**
 * @name accounts/inviteShopOwner
 * @summary Invite a new user as owner of a new shop
 * @memberof Methods/Accounts
 * @method
 * @param {Object} options -
 * @param {String} options.email - email of invitee
 * @param {String} options.name - name of invitee
 * @returns {Boolean} returns true
 */
export function inviteShopOwner(options) {
  check(options, Object);
  check(options.email, String);
  check(options.name, String);
  const { name, email } = options;

  if (!Reaction.hasPermission("admin", this.userId, Reaction.getPrimaryShopId())) {
    throw new Meteor.Error("access-denied", "Access denied");
  }
  const user = Meteor.users.findOne({ "emails.address": email });
  let userId;
  if (user) {
    // TODO: Verify email address
    userId = user._id;
  } else {
    userId = MeteorAccounts.createUser({
      email,
      name,
      profile: { invited: true }
    });
  }

  Meteor.call("shop/createShop", userId);
  const primaryShop = Reaction.getPrimaryShop();

  // Compile Email with SSR
  const tpl = "accounts/inviteShopOwner";
  const subject = "accounts/inviteShopOwner/subject";

  SSR.compileTemplate(tpl, Reaction.Email.getTemplate(tpl));
  SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl));

  const emailLogo = Reaction.Email.getShopLogo(primaryShop);
  const token = Random.id();
  const currentUser = Meteor.users.findOne(this.userId);
  const currentUserName = getCurrentUserName(currentUser);
  // uses primaryShop's data (name, address etc) in email copy sent to new merchant
  const dataForEmail = getDataForEmail({ shop: primaryShop, currentUserName, name, token, emailLogo });

  Meteor.users.update(userId, {
    $set: {
      "services.password.reset": { token, email, when: new Date() },
      name
    }
  });

  Reaction.Email.send({
    to: email,
    from: `${_.get(dataForEmail, "primaryShop.name")} <${_.get(dataForEmail, "primaryShop.emails[0].address")}>`,
    subject: SSR.render(subject, dataForEmail),
    html: SSR.render(tpl, dataForEmail)
  });

  return true;
}

/**
 * @name accounts/inviteShopMember
 * @summary Invite new admin users (not consumers) to secure access in the dashboard to permissions
 * as specified in packages/roles
 * @memberof Methods/Accounts
 * @method
 * @param {Object} options -
 * @param {String} options.shopId - shop to invite user
 * @param {String} options.groupId - groupId to invite user
 * @param {String} options.email - email of invitee
 * @param {String} options.name - name of invitee
 * @returns {Boolean} returns true
 */
export function inviteShopMember(options) {
  const { shopId, email, name, groupId } = options;
  check(options, Object);
  check(shopId, String);
  check(email, String);
  check(name, String);
  check(groupId, String);

  this.unblock();

  const shop = Shops.findOne(shopId);
  const primaryShop = Reaction.getPrimaryShop();

  if (!shop) {
    const msg = `accounts/inviteShopMember - Shop ${shopId} not found`;
    Logger.error(msg);
    throw new Meteor.Error("not-found", msg);
  }

  if (!Reaction.hasPermission("reaction-accounts", this.userId, shopId)) {
    Logger.error(`User ${this.userId} does not have reaction-accounts permissions`);
    throw new Meteor.Error("access-denied", "Access denied");
  }

  const group = Groups.findOne({ _id: groupId }) || {};

  // check to ensure that invitee has roles required to perform the invitation
  if (!Reaction.canInviteToGroup({ group, user: Meteor.user() })) {
    throw new Meteor.Error("access-denied", "Cannot invite to group");
  }

  if (group.slug === "owner") {
    throw new Meteor.Error("bad-request", "Cannot directly invite owner");
  }

  const currentUser = Meteor.users.findOne(this.userId);
  const currentUserName = getCurrentUserName(currentUser);
  const emailLogo = Reaction.Email.getShopLogo(primaryShop);
  const user = Meteor.users.findOne({ "emails.address": email });
  const token = Random.id();
  let dataForEmail;
  let userId;
  let tpl;
  let subject;

  // If the user already has an account, send informative email, not "invite" email
  if (user) {
    // The user already exists, we promote the account, rather than creating a new one
    userId = user._id;
    Meteor.call("group/addUser", userId, groupId);

    // do not send token, as no password reset is needed
    const url = Meteor.absoluteUrl();

    // use primaryShop's data (name, address etc) in email copy sent to new shop manager
    dataForEmail = getDataForEmail({ shop: primaryShop, currentUserName, name, emailLogo, url });

    // Get email template and subject
    tpl = "accounts/inviteShopMember";
    subject = "accounts/inviteShopMember/subject";
  } else {
    // The user does not already exist, we need to create a new account
    userId = MeteorAccounts.createUser({
      profile: { invited: true },
      email,
      name,
      groupId
    });
    // set token to be used for first login for the new account
    const tokenUpdate = {
      "services.password.reset": { token, email, when: new Date() },
      name
    };
    Meteor.users.update(userId, { $set: tokenUpdate });

    // use primaryShop's data (name, address etc) in email copy sent to new shop manager
    dataForEmail = getDataForEmail({ shop: primaryShop, currentUserName, name, token, emailLogo });

    // Get email template and subject
    tpl = "accounts/inviteNewShopMember";
    subject = "accounts/inviteNewShopMember/subject";
  }

  dataForEmail.groupName = _.startCase(group.name);

  // Compile Email with SSR
  SSR.compileTemplate(tpl, Reaction.Email.getTemplate(tpl));
  SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl));

  // send invitation email from primary shop email
  Reaction.Email.send({
    to: email,
    from: `${dataForEmail.primaryShop.name} <${dataForEmail.primaryShop.emails[0].address}>`,
    subject: SSR.render(subject, dataForEmail),
    html: SSR.render(tpl, dataForEmail)
  });

  return true;
}

/**
 * @name accounts/sendWelcomeEmail
 * @summary Send an email to consumers on sign up
 * @memberof Methods/Accounts
 * @method
 * @param {String} shopId - shopId of new User
 * @param {String} userId - new userId to welcome
 * @param {String} token - the token for the verification URL
 * @returns {Boolean} returns true on success
 */
export function sendWelcomeEmail(shopId, userId, token) {
  check(shopId, String);
  check(userId, String);
  check(token, String);

  this.unblock();

  const account = Accounts.findOne(userId);
  // anonymous users arent welcome here
  if (!account.emails || !account.emails.length > 0) {
    return false;
  }

  const shop = Shops.findOne(shopId);

  // Get shop logo, if available. If not, use default logo from file-system
  const emailLogo = Reaction.Email.getShopLogo(shop);
  const copyrightDate = new Date().getFullYear();
  const user = Meteor.user();
  const dataForEmail = {
    // Shop Data
    shop,
    contactEmail: shop.emails[0].address,
    emailLogo,
    copyrightDate,
    legalName: _.get(shop, "addressBook[0].company"),
    physicalAddress: {
      address: `${_.get(shop, "addressBook[0].address1")} ${_.get(shop, "addressBook[0].address2")}`,
      city: _.get(shop, "addressBook[0].city"),
      region: _.get(shop, "addressBook[0].region"),
      postal: _.get(shop, "addressBook[0].postal")
    },
    shopName: shop.name,
    socialLinks: {
      display: true,
      facebook: {
        display: true,
        icon: `${Meteor.absoluteUrl()}resources/email-templates/facebook-icon.png`,
        link: "https://www.facebook.com"
      },
      googlePlus: {
        display: true,
        icon: `${Meteor.absoluteUrl()}resources/email-templates/google-plus-icon.png`,
        link: "https://plus.google.com"
      },
      twitter: {
        display: true,
        icon: `${Meteor.absoluteUrl()}resources/email-templates/twitter-icon.png`,
        link: "https://www.twitter.com"
      }
    },
    user
  };

  dataForEmail.verificationUrl = MeteorAccounts.urls.verifyEmail(token);

  const userEmail = account.emails[0].address;
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
}

/**
 * @name accounts/addUserPermissions
 * @memberof Methods/Accounts
 * @method
 * @param {String} userId - userId
 * @param {Array|String} permissions - Name of role/permission.
 * If array, users returned will have at least one of the roles specified but need not have _all_ roles.
 * @param {String} [group] Optional name of group to restrict roles to. User's Roles.GLOBAL_GROUP will also be checked.
 * @returns {Boolean} success/failure
 */
export function addUserPermissions(userId, permissions, group) {
  if (!Reaction.hasPermission("reaction-accounts", Meteor.userId(), group)) {
    throw new Meteor.Error("access-denied", "Access denied");
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
}

/**
 * @name accounts/removeUserPermissions
 * @memberof Methods/Accounts
 * @method
 * @param {String} userId - userId
 * @param {Array|String} permissions - Name of role/permission.
 * If array, users returned will have at least one of the roles specified but need not have _all_ roles.
 * @param {String} [group] Optional name of group to restrict roles to.
 * @returns {Boolean} success/failure
 */
export function removeUserPermissions(userId, permissions, group) {
  if (!Reaction.hasPermission("reaction-accounts", Meteor.userId(), group)) {
    throw new Meteor.Error("access-denied", "Access denied");
  }
  check(userId, String);
  check(permissions, Match.OneOf(String, Array));
  check(group, Match.Optional(String, null));
  this.unblock();
  try {
    return Roles.removeUsersFromRoles(userId, permissions, group);
  } catch (error) {
    Logger.error(error);
    throw new Meteor.Error("access-denied", "Access Denied");
  }
}

/**
 * @name accounts/setUserPermissions
 * @memberof Methods/Accounts
 * @method
 * @param {String} userId - userId
 * @param {String|Array} permissions - string/array of permissions
 * @param {String} group - group
 * @returns {Boolean} returns Roles.setUserRoles result
 */
export function setUserPermissions(userId, permissions, group) {
  if (!Reaction.hasPermission("reaction-accounts", Meteor.userId(), group)) {
    throw new Meteor.Error("access-denied", "Access denied");
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

/**
 * @name getCurrentUserName
 * @memberof Methods/Accounts
 * @method
 * @private
 * @param  {Object} currentUser - User
 * @return {String} Name of currentUser or "Admin"
 */
function getCurrentUserName(currentUser) {
  if (currentUser && currentUser.profile && currentUser.profile.name) {
    return currentUser.profile.name;
  }

  if (currentUser.name) {
    return currentUser.name;
  }

  if (currentUser.username) {
    return currentUser.username;
  }

  return "Admin";
}

/**
 * @name getDataForEmail
 * @memberof Methods/Accounts
 * @method
 * @private
 * @param  {Object} options - shop, currentUserName, token, emailLogo, name
 * @return {Object} data - primaryShop, shop, contactEmail, homepage,
 * emailLogo, legalName, physicalAddress, shopName, socialLinks, user, invitedUserName, url
 */
function getDataForEmail(options) {
  const { shop, currentUserName, token, emailLogo, name, url } = options;
  const primaryShop = Shops.findOne(Reaction.getPrimaryShopId());
  const copyrightDate = new Date().getFullYear();

  return {
    primaryShop, // Primary shop data - may or may not be the same as shop
    shop, // Shop Data
    contactEmail: _.get(shop, "emails[0].address"),
    homepage: Meteor.absoluteUrl(),
    emailLogo,
    copyrightDate,
    legalName: _.get(shop, "addressBook[0].company"),
    physicalAddress: {
      address: `${_.get(shop, "addressBook[0].address1")} ${_.get(shop, "addressBook[0].address2")}`,
      city: _.get(shop, "addressBook[0].city"),
      region: _.get(shop, "addressBook[0].region"),
      postal: _.get(shop, "addressBook[0].postal")
    },
    shopName: shop.name,
    socialLinks: {
      display: true,
      facebook: {
        display: true,
        icon: `${Meteor.absoluteUrl()}resources/email-templates/facebook-icon.png`,
        link: "https://www.facebook.com"
      },
      googlePlus: {
        display: true,
        icon: `${Meteor.absoluteUrl()}resources/email-templates/google-plus-icon.png`,
        link: "https://plus.google.com"
      },
      twitter: {
        display: true,
        icon: `${Meteor.absoluteUrl()}resources/email-templates/twitter-icon.png`,
        link: "https://www.twitter.com"
      }
    },
    user: Meteor.user(), // Account Data
    currentUserName,
    invitedUserName: name,
    url: url || getEmailUrl(token)
  };

  function getEmailUrl(userToken) {
    if (userToken) {
      return MeteorAccounts.urls.enrollAccount(userToken);
    }
    return Meteor.absoluteUrl();
  }
}

/**
 * @name accounts/createFallbackLoginToken
 * @memberof Methods/Accounts
 * @method
 * @summary Returns a new loginToken for current user, that can be used for special login scenarios
 * e.g. store the newly created token as cookie on the browser, if the client does not offer local storage.
 * @returns {String} loginToken for current user
 */
export function createFallbackLoginToken() {
  if (this.userId) {
    const stampedLoginToken = MeteorAccounts._generateStampedLoginToken();
    const loginToken = stampedLoginToken.token;
    MeteorAccounts._insertLoginToken(this.userId, stampedLoginToken);
    return loginToken;
  }
}

/**
 * @name accounts/setProfileCurrency
 * @memberof Methods/Accounts
 * @method
 * @summary Sets users profile currency
 */
export function setProfileCurrency(currencyName) {
  check(currencyName, String);
  if (this.userId) {
    Accounts.update(this.userId, { $set: { "profile.currency": currencyName } });
    Hooks.Events.run("afterAccountsUpdate", this.userId, {
      accountId: this.userId,
      updatedFields: ["currency"]
    });
  }
}

Meteor.methods({
  "accounts/verifyAccount": verifyAccount,
  "accounts/validateAddress": validateAddress,
  "accounts/currentUserHasPassword": currentUserHasPassword,
  "accounts/addressBookAdd": addressBookAdd,
  "accounts/addressBookUpdate": addressBookUpdate,
  "accounts/addressBookRemove": addressBookRemove,
  "accounts/inviteShopMember": inviteShopMember,
  "accounts/inviteShopOwner": inviteShopOwner,
  "accounts/sendWelcomeEmail": sendWelcomeEmail,
  "accounts/addUserPermissions": addUserPermissions,
  "accounts/removeUserPermissions": removeUserPermissions,
  "accounts/setUserPermissions": setUserPermissions,
  "accounts/createFallbackLoginToken": createFallbackLoginToken,
  "accounts/updateEmailAddress": updateEmailAddress,
  "accounts/removeEmailAddress": removeEmailAddress,
  "accounts/setProfileCurrency": setProfileCurrency
});
