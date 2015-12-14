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
    return true;
  },
  /**
   * hasPermission - server permissions checks
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
   * @param {String} checkUserId - userId, defaults to Meteor.userId()
   * @param {String} group - default to shopId
   * @return {Boolean} Boolean - true if has permission
   */
  hasPermission: function (checkPermissions, checkUserId, group) {
    check(checkPermissions, Match.OneOf(String, Array));
    check(checkUserId, Match.OneOf(String, null, undefined));

    let shopId = group || this.getShopId();
    let permissions = [];

    // use Roles.userIsInRole directly with publications
    let userId = checkUserId || this.userId || Meteor.userId();

    // permissions can be either a string or an array
    // we'll force it into an array so we can add
    // admin roles
    if (!_.isArray(checkPermissions)) {
      permissions = [checkPermissions];
    } else {
      permissions = checkPermissions;
    }
    // if the user has admin, owner permissions we'll always check if those roles are enough
    permissions.push("admin", "owner");
    // check if userIs the Roles
    if (Roles.userIsInRole(userId, permissions, shopId) === true) {
      ReactionCore.Log.debug("Permission granted.", userId, permissions, shopId);
      return true;
    } else if (Roles.userIsInRole(userId,
        permissions,
        Roles.GLOBAL_GROUP
      ) === true) {
      ReactionCore.Log.debug("Permission granted.", userId, permissions, shopId);
      return true;
    }

    // global roles check
    let sellerShopPermissions = Roles.getGroupsForUser(userId, "admin");
    // we're looking for seller permissions.
    if (sellerShopPermissions) {
      // loop through shops roles and check permissions
      for (let key in sellerShopPermissions) {
        if ({}.hasOwnProperty.call(sellerShopPermissions, key)) {
          let shop = sellerShopPermissions[key];
          if (Roles.userIsInRole(checkUserId, permissions, shop)) {
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
