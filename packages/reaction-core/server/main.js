/**
 * Application Startup
 * ReactionCore Server Configuration
 */

/**
 * configure bunyan logging module for reaction server
 * See: https://github.com/trentm/node-bunyan#levels
 */
const levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];
const mode = process.env.NODE_ENV || "production";
let isDebug = Meteor.settings.isDebug || process.env.REACTION_DEBUG || "INFO";

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


SyncedCron.add({
  name: "Call 'shop/fetchCurrencyRates' Method",
  schedule: parser => {
    // parser is a later.parse object
    // http://bunkat.github.io/later/parsers.html
    return parser.text('every 30 seconds');
  },
  job: intendedAt => {
    try {
      Meteor.call('fetchCurrencyRate');
    } catch (error) {
      if (error.message === 'notConfigured') {
        ReactionCore.Log.warn(
          "Open Exchange Rates AppId not configured. Configure for current rates."
        );
      }
    }
    //console.log('fetchCurrencyRate: finished;');
    //console.log('job should be running at:' + intendedAt);
    //return true;
  }
});

/**
 * ReactionCore methods (server)
 */

_.extend(ReactionCore, {
  init: function () {
    SyncedCron.start();

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
    if (this.getCurrentShopCursor(client)) {
      let cursor = this.getCurrentShopCursor(client);
      return cursor.fetch()[0];
    }
  },
  getShopId: function (client) {
    if (this.getCurrentShop(client)) {
      return this.getCurrentShop(client)._id;
    }
  },
  getDomain: function () {
    if (Meteor.absoluteUrl()) {
      return Meteor.absoluteUrl().split("/")[2].split(":")[0];
    }
    return "localhost";
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
    let shopMail = ReactionCore.Collections.Packages.findOne({
      shopId: this.getShopId(),
      name: "core"
    }).settings.mail;
    let processUrl = process.env.MAIL_URL;
    let settingsUrl = Meteor.settings.MAIL_URL;
    if (user && password && host && port) {
      let mailString = `smtp://${user}:${password}@${host}:${port}/`;
      mailUrl = processUrl = settingsUrl = mailString;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    } else if (shopMail.user && shopMail.password && shopMail.host &&
      shopMail.port) {
      ReactionCore.Log.info("setting default mail url to: " + shopMail
        .host);
      let mailString =
        `smtp://${shopMail.user}:${shopMail.password}@${shopMail.host}:${shopMail.port}/`;
      let mailUrl = processUrl = settingsUrl = mailString;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    } else if (settingsUrl && !processUrl) {
      let mailUrl = processUrl = settingsUrl;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    }
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

/*
 * Execute start up fixtures
 */

Meteor.startup(function () {
  ReactionCore.init();
});
