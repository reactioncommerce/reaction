/**
 * ReactionRegistry createDefaultAdminUser
 * @summary Method that creates default admin user
 * Settings load precendence:
 *  1. settings in meteor.settings
 *  2. environment variables
 * @returns {String} return userId
 */
ReactionRegistry.createDefaultAdminUser = function () {
  let options = {};
  const domain = ReactionRegistry.getRegistryDomain();
  const defaultAdminRoles = ["owner", "admin", "guest", "account/profile"];
  const shopId = ReactionCore.getShopId();
  let accountId;

  // if an admin user has already been created, we'll exit
  if (Roles.getUsersInRole(defaultAdminRoles, shopId).count() !== 0) {
    return ""; // this default admin has already been created for this shop.
  }

  // run hooks on options object before creating user
  // (the options object must be returned from all callbacks)
  options = ReactionCore.Hooks.Events.run("beforeCreateDefaultAdminUser", options);

  //
  // process Meteor settings and env variables for initial user config
  //

  // defaults use either env or generated
  options.email = process.env.REACTION_EMAIL || Random.id(8).toLowerCase() +
    "@" + domain;
  options.username = process.env.REACTION_USER || "Admin"; // username
  options.password = process.env.REACTION_AUTH || Random.secret(8);
  // but we can override with provided `meteor --settings`
  if (Meteor.settings) {
    if (Meteor.settings.reaction) {
      options.username = Meteor.settings.reaction.REACTION_USER || "Admin";
      options.password = Meteor.settings.reaction.REACTION_AUTH || Random.secret(
        8);
      options.email = Meteor.settings.reaction.REACTION_EMAIL || Random.id(8)
        .toLowerCase() + "@" + domain;
      ReactionCore.Log.info("Using meteor --settings to create admin user");
    }
  }

  // set the default shop email to the default admin email
  ReactionCore.Collections.Shops.update(shopId, {
    $addToSet: {
      emails: {
        address: options.email,
        verified: true
      },
      domains: Meteor.settings.ROOT_URL
    }
  });

  //
  // create the new admin user
  //

  // we're checking again to see if this user was created but not specifically for this shop.
  if (Meteor.users.find({
    "emails.address": options.email
  }).count() === 0) {
    accountId = Accounts.createUser(options);
  } else {
    // this should only occur when existing admin creates a new shop
    accountId = Meteor.users.findOne({
      "emails.address": options.email
    })._id;
  }

  //
  // send verification email
  //

  // we dont need to validate admin user in development
  if (process.env.NODE_ENV === "development") {
    Meteor.users.update({
      "_id": accountId,
      "emails.address": options.email
    }, {
      $set: {
        "emails.$.verified": true
      }
    });
  } else { // send verification email to admin
    try {
      // if server is not confgured. Error in configuration
      // are caught, but admin isn't verified.
      Accounts.sendVerificationEmail(accountId);
    } catch (error) {
      ReactionCore.Log.warn(
        "Unable to send admin account verification email.", error);
    }
  }

  //
  // Set Default Roles
  //

  // we don't use accounts/addUserPermissions here because we may not yet have permissions
  Roles.setUserRoles(accountId, _.uniq(defaultAdminRoles), shopId);
  // // the reaction owner has permissions to all sites by default
  Roles.setUserRoles(accountId, _.uniq(defaultAdminRoles), Roles.GLOBAL_GROUP);
  // initialize package permissions
  // we don't need to do any further permission configuration
  // it is taken care of in the assignOwnerRoles
  let packages = ReactionCore.Collections.Packages.find().fetch();
  for (let pkg of packages) {
    ReactionRegistry.assignOwnerRoles(shopId, pkg.name, pkg.registry);
  }

  //
  //  notify user that admin was created account email should print on console
  //

  ReactionCore.Log.warn(
    `\n *********************************
      \n  IMPORTANT! DEFAULT ADMIN INFO
      \n  EMAIL/LOGIN: ${options.email}
      \n  PASSWORD: ${options.password}
      \n ********************************* \n\n`
  );

  // run hooks on new user object
  const user = Meteor.users.findOne(accountId);
  ReactionCore.Hooks.Events.run("afterCreateDefaultAdminUser", user);
  return accountId;
};
