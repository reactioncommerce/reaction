
/**
* Application Startup
* ReactionCore Server Configuration
*/


/**
* configure bunyan logging module for reaction server
* See: https://github.com/trentm/node-bunyan#levels
*/

var formatOut, isDebug, levels, _ref, _ref1;

isDebug = Meteor.settings.isDebug || process.env.REACTION_DEBUG || "INFO";

levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

if (isDebug === true || (process.env.NODE_ENV === "development" && isDebug !== false)) {
  if (typeof isDebug !== 'boolean' && typeof isDebug !== 'undefined') {
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
    outputMode: 'short',
    levelInString: false
  });
}

ReactionCore.Events = logger.bunyan.createLogger({
  name: 'core',
  stream: (isDebug !== "DEBUG" ? formatOut : process.stdout),
  level: 'debug'
});

ReactionCore.Events.level(isDebug);


/**
 * ReactionCore methods (server)
 */

_.extend(ReactionCore, {
  init: function() {
    var e;
    try {
      ReactionRegistry.loadFixtures();
    } catch (_error) {
      e = _error;
      ReactionCore.Events.error(e);
    }
    return true;
  },

  getCurrentShopCursor: function(client) {
    var cursor, domain;
    domain = this.getDomain(client);
    cursor = ReactionCore.Collections.Shops.find({
      domains: domain
    }, {
      limit: 1
    });
    if (!cursor.count()) {
      ReactionCore.Events.debug("Reaction Configuration: Add a domain entry to shops for: ", domain);
    }
    return cursor;
  },
  getCurrentShop: function(client) {
    var cursor;
    cursor = this.getCurrentShopCursor(client);
    return cursor.fetch()[0];
  },
  getShopId: function(client) {
    var _ref2;
    return (_ref2 = this.getCurrentShop(client)) != null ? _ref2._id : void 0;
  },
  getDomain: function(client) {
    return Meteor.absoluteUrl().split('/')[2].split(':')[0];
  },
  hasPermission: function(permissions) {
    var shop, _i, _len, _ref2;
    if (Roles.userIsInRole(Meteor.userId(), permissions, this.getShopId())) {
      return true;
    } else if (Roles.userIsInRole(Meteor.userId(), permissions, Roles.GLOBAL_GROUP)) {
      return true;
    }
    _ref2 = this.getSellerShopId();
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      shop = _ref2[_i];
      if (Roles.userIsInRole(Meteor.userId(), permissions, shop)) {
        return true;
      }
    }
    return false;
  },
  hasOwnerAccess: function(client) {
    var ownerPermissions;
    ownerPermissions = ['owner'];
    return this.hasPermission(ownerPermissions);
  },
  hasAdminAccess: function(client) {
    var adminPermissions;
    adminPermissions = ['owner', 'admin'];
    return this.hasPermission(adminPermissions);
  },
  hasDashboardAccess: function(client) {
    var dashboardPermissions;
    dashboardPermissions = ['owner', 'admin', 'dashboard'];
    return this.hasPermission(dashboardPermissions);
  },
  getSellerShopId: function(client) {
    return Roles.getGroupsForUser(Meteor.userId(), 'admin');
  },
  configureMailUrl: function(user, password, host, port) {
    var shopMail;
    shopMail = ReactionCore.Collections.Packages.findOne({
      shopId: this.getShopId(),
      name: "core"
    }).settings.mail;
    if (user && password && host && port) {
      return process.env.MAIL_URL = Meteor.settings.MAIL_URL = "smtp://" + user + ":" + password + "@" + host + ":" + port + "/";
    } else if (shopMail.user && shopMail.password && shopMail.host && shopMail.port) {
      ReactionCore.Events.info("setting default mail url to: " + shopMail.host);
      return process.env.MAIL_URL = Meteor.settings.MAIL_URL = "smtp://" + shopMail.user + ":" + shopMail.password + "@" + shopMail.host + ":" + shopMail.port + "/";
    } else if (Meteor.settings.MAIL_URL && !process.env.MAIL_URL) {
      return process.env.MAIL_URL = Meteor.settings.MAIL_URL;
    }
    if (!process.env.MAIL_URL) {
      ReactionCore.Events.warn('Mail server not configured. Unable to send email.');
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

Meteor.startup(function() {
  ReactionCore.init();
  return ReactionCore.Events.info("Reaction Core initialization finished. ");
});
