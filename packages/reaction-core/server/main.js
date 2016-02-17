/**
 * Application Startup
 * ReactionCore Server Configuration
 */

/**
 * ReactionCore methods (server)
 */

_.extend(ReactionCore, {
  init: function () {
    ReactionCore.Log.info("JobServer started:", Jobs.startJobServer());
    // uncomment for JobCollection debug
    // Jobs.setLogStream(process.stdout);
    ReactionRegistry.loadPackages();
    // timing is important, packages are rqd
    // for initilial permissions configuration.
    ReactionRegistry.createDefaultAdminUser();
    return true;
  },
  /**
   * hasPermission - server
   * server permissions checks
   * hasPermission exists on both the server and the client.
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
   * @param {String} checkUserId - userId, defaults to Meteor.userId()
   * @param {String} checkGroup group - default to shopId
   * @return {Boolean} Boolean - true if has permission
   */
  hasPermission: function (checkPermissions, userId = Meteor.userId(), checkGroup = ReactionCore.getShopId()) {
    check(checkPermissions, Match.OneOf(String, Array));
    check(userId, String);
    check(checkGroup, Match.Optional(String));

    let permissions = ["owner"];
    // default group to the shop or global if shop
    // isn't defined for some reason.
    if (checkGroup !== undefined && typeof checkGroup === "string") {
      group = checkGroup;
    } else {
      group = ReactionCore.getShopId() || Roles.GLOBAL_GROUP;
    }

    // permissions can be either a string or an array
    // we'll force it into an array and use that
    if (checkPermissions === undefined) {
      permissions = ["owner"];
    } else if (typeof checkPermissions === "string") {
      permissions = [checkPermissions];
    } else {
      permissions = checkPermissions;
    }
    // if the user has admin, owner permissions we'll always check if those roles are enough
    permissions.push("owner");
    permissions = _.uniq(permissions);

    //
    // return if user has permissions in the group
    //
    if (Roles.userIsInRole(userId, permissions, group)) {
      return true;
    }
    // global roles check
    let sellerShopPermissions = Roles.getGroupsForUser(userId, "admin");
    // we're looking for seller permissions.
    if (sellerShopPermissions) {
      // loop through shops roles and check permissions
      for (let key in sellerShopPermissions) {
        if (key) {
          let shop = sellerShopPermissions[key];
          if (Roles.userIsInRole(userId, permissions, shop)) {
            return true;
          }
        }
      }
    }
    // no specific permissions found returning false
    return false;
  },
  hasOwnerAccess: function () {
    let ownerPermissions = ["owner"];
    return this.hasPermission(ownerPermissions);
  },
  hasAdminAccess: function () {
    let adminPermissions = ["owner", "admin"];
    return this.hasPermission(adminPermissions);
  },
  hasDashboardAccess: function () {
    let dashboardPermissions = ["owner", "admin", "dashboard"];
    return this.hasPermission(dashboardPermissions);
  },
  getSellerShopId: function () {
    return Roles.getGroupsForUser(this.userId, "admin");
  },
  configureMailUrl: function (user, password, host, port) {
    let shopSettings = ReactionCore.Collections.Packages.findOne({
      shopId: this.getShopId(),
      name: "core"
    });
    let shopMail = {};

    if (shopSettings) {
      shopMail = shopSettings.settings.mail || {};
    }

    let processUrl = process.env.MAIL_URL;
    let settingsUrl = Meteor.settings.MAIL_URL;

    if (user && password && host && port) {
      let mailString = `smtp://${user}:${password}@${host}:${port}/`;
      const mailUrl = processUrl = settingsUrl = mailString;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    } else if (shopMail.user && shopMail.password && shopMail.host &&
      shopMail.port) {
      let mailString =
        `smtp://${shopMail.user}:${shopMail.password}@${shopMail.host}:${shopMail.port}/`;
      const mailUrl = processUrl = settingsUrl = mailString;
      process.env.MAIL_URL = mailUrl;

      ReactionCore.Log.info(`setting default mail url to: ${shopMail.host}`);
      return mailUrl;
    } else if (settingsUrl && !processUrl) {
      const mailUrl = processUrl = settingsUrl;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    }
    // return reasonable warning that we're not configured correctly
    if (!process.env.MAIL_URL) {
      ReactionCore.Log.warn(
        "Mail server not configured. Unable to send email.");
      return false;
    }
  }
});

// Method Check Helper
Match.OptionalOrNull = function (pattern) {
  return Match.OneOf(void 0, null, pattern);
};
