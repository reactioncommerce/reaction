/**
 * Application Startup
 * ReactionCore Server Configuration
 */

/**
 * configure bunyan logging module for reaction server
 * See: https://github.com/trentm/node-bunyan#levels
 */

let isDebug = Meteor.settings.isDebug || process.env.REACTION_DEBUG || "INFO";
let levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];
let mode = process.env.NODE_ENV || "production";

if (isDebug === true || mode === "development" && isDebug !== false) {
  if (typeof isDebug !== "boolean" && typeof isDebug !== undefined) {
    isDebug = isDebug.toUpperCase();
  }
  if (!_.contains(levels, isDebug)) {
    isDebug = "WARN";
  }
}

if (process.env.VELOCITY_CI === "1") {
  formatOut = process.stdout;
} else {
  formatOut = logger.format({
    outputMode: "short",
    levelInString: false
  });
}

ReactionCore.Log = logger.bunyan.createLogger({
  name: "core",
  stream: isDebug !== "DEBUG" ? formatOut : process.stdout,
  level: "debug"
});

// set logging level
ReactionCore.Log.level(isDebug);

/**
 * ReactionCore methods (server)
 */

_.extend(ReactionCore, {
  init: function () {
    try {
      ReactionRegistry.loadFixtures();
    } catch (error) {
      ReactionCore.Log.error("loadFixtures: ", error.message);
    }
    return true;
  },

  getCurrentShopCursor: function (client) {
    let domain = this.getDomain(client);
    let cursor = ReactionCore.Collections.Shops.find({
      domains: domain
    }, {
      limit: 1
    });
    if (!cursor.count()) {
      ReactionCore.Log.debug("Add a domain entry to shops for ",
        domain);
    }
    return cursor;
  },
  getCurrentShop: function (client) {
    let cursor = this.getCurrentShopCursor(client);
    return cursor.fetch()[0];
  },
  getShopId: function (client) {
    if (this.getCurrentShop(client)) {
      return this.getCurrentShop(client)._id;
    }
  },
  getDomain: function () {
    return Meteor.absoluteUrl().split("/")[2].split(":")[0];
  },
  /**
   * hasPermission - server permissions checks
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
   * @param {String} userId - userId, defaults to Meteor.userId()
   * @param {String} role - default to shopId
   * @return {Boolean} Boolean - true if has permission
   */
  hasPermission: function (checkPermissions, userId, role) {
    // use current user if userId if not provided
    let checkUserId = userId || Meteor.userId();
    let shopId = role || this.getShopId();
    let permissions = [];
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
    if (Roles.userIsInRole(checkUserId, permissions, shopId)) {
      return true;
    } else if (Roles.userIsInRole(checkUserId,
        permissions,
        Roles.GLOBAL_GROUP
      )) {
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
          if (Roles.userIsInRole(checkUserId, permissions, shop)) {
            return true;
          }
        }
      }
    }
    // no specific permissions found
    // returning false
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
    let shopMail = ReactionCore.Collections.Packages.findOne({
      shopId: this.getShopId(),
      name: "core"
    }).settings.mail;

    if (user && password && host && port) {
      let mailString = "smtp://" + user + ":" + password + "@" + host +
        ":" + port + "/";
      let processUrl = process.env.MAIL_URL;
      let settingsUrl = Meteor.settings.MAIL_URL;
      mailUrl = processUrl = settingsUrl = mailString;
      return mailString;
    } else if (shopMail.user && shopMail.password && shopMail.host &&
      shopMail.port) {
      ReactionCore.Log.info("setting default mail url to: " + shopMail
        .host);
      let mailString = "smtp://" + shopMail.user + ":" + shopMail.password +
        "@" + shopMail.host + ":" + shopMail.port + "/";
      let mailUrl = process.env.MAIL_URL = Meteor.settings.MAIL_URL =
        mailString;
      return mailUrl;
    } else if (Meteor.settings.MAIL_URL && !process.env.MAIL_URL) {
      let mailUrl = process.env.MAIL_URL = Meteor.settings.MAIL_URL;
      return mailUrl;
    }
    if (!process.env.MAIL_URL) {
      ReactionCore.Log.warn(
        'Mail server not configured. Unable to send email.');
      return false;
    }
  }
});

// Method Check Helper
Match.OptionalOrNull = function (pattern) {
  return Match.OneOf(void 0, null, pattern);
};

/*
 * Execute start up fixtures
 */

Meteor.startup(function () {
  ReactionCore.init();
  return ReactionCore.Log.info("Reaction Core initialization finished. ");
});
