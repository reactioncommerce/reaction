import { Security } from "meteor/ongoworks:security";
import { Roles } from "meteor/alanning:roles";
import * as Collections from "/lib/collections";
import { Jobs } from "/imports/utils/jobs";
import Reaction from "/imports/plugins/core/core/server/Reaction";

const {
  Accounts,
  Packages,
  Emails,
  MediaRecords,
  Orders,
  Products,
  Shipping,
  Shops,
  Tags,
  Templates,
  Translations
} = Collections;

/**
 * security definitions
 *
 * The following security definitions use the ongoworks:security package.
 * Rules within a single chain stack with AND relationship. Multiple
 * chains for the same collection stack with OR relationship.
 * See https://github.com/ongoworks/meteor-security
 *
 * It"s important to note that these security rules are for inserts,
 * updates, and removes initiated from untrusted (client) code.
 * Thus there may be other actions that certain roles are allowed to
 * take, but they do not necessarily need to be listed here if the
 * database operation is executed in a server method.
 */

export default function () {
  /*
   * Define some additional rule chain methods
   */

  Security.defineMethod("ifHasRoleForActiveShop", {
    fetch: [],
    transform: null,
    allow(type, arg, userId) {
      if (!arg) throw new Error("ifHasRole security rule method requires an argument");
      if (arg.role) {
        // Note: userId is passed to getShopId to ensure that it returns the correct shop based on the User Preference
        // if not passed, getShopId can default to primaryShopId if userId is not available in the context the code is run
        const shopId = Reaction.getUserShopId(userId) || Reaction.getShopId();

        return Roles.userIsInRole(userId, arg.role, shopId);
      }
      return Roles.userIsInRole(userId, arg);
    }
  });

  // use this rule for collections other than Shops
  // matches this.shopId
  Security.defineMethod("ifShopIdMatches", {
    fetch: [],
    deny(type, arg, userId, doc) {
      // Note: userId is passed to getShopId to ensure that it returns the correct shop based on the User Preference
      // if not passed, getShopId can default to primaryShopId if userId is not available in the context the code is run
      const shopId = Reaction.getUserShopId(userId) || Reaction.getShopId();

      return doc.shopId !== shopId;
    }
  });
  // this rule is for the Shops collection
  // use ifShopIdMatches for match on this._id
  Security.defineMethod("ifShopIdMatchesThisId", {
    fetch: [],
    deny(type, arg, userId, doc) {
      // Note: userId is passed to getShopId to ensure that it returns the correct shop based on the User Preference
      // if not passed, getShopId can default to primaryShopId if userId is not available in the context the code is run
      const shopId = Reaction.getUserShopId(userId) || Reaction.getShopId();

      return doc._id !== shopId;
    }
  });

  Security.defineMethod("ifFileBelongsToShop", {
    fetch: [],
    deny(type, arg, userId, doc) {
      // Note: userId is passed to getShopId to ensure that it returns the correct shop based on the User Preference
      // if not passed, getShopId can default to primaryShopId if userId is not available in the context the code is run
      const shopId = Reaction.getUserShopId(userId) || Reaction.getShopId();

      return doc.metadata.shopId !== shopId;
    }
  });

  Security.defineMethod("ifUserIdMatches", {
    fetch: [],
    deny(type, arg, userId, doc) {
      return (userId && doc.userId && doc.userId !== userId) || (doc.userId && !userId);
    }
  });

  Security.defineMethod("ifUserIdMatchesProp", {
    fetch: [],
    deny(type, arg, userId, doc) {
      return doc[arg] !== userId;
    }
  });

  /**
   * Define all security rules
   */

  /**
   * admin security
   * Permissive security for users with the "admin" role
   */

  Security.permit(["insert", "update", "remove"])
    .collections([Accounts, Products, Tags, Translations, Shipping, Orders, Packages, Templates, Jobs])
    .ifHasRoleForActiveShop({ role: "admin" })
    .ifShopIdMatches()
    .exceptProps(["shopId"])
    .allowInClientCode();

  /*
   * Permissive security for users with the "admin" role for FS.Collections
   */

  Security.permit(["insert", "update", "remove"])
    .collections([MediaRecords])
    .ifHasRoleForActiveShop({ role: ["admin", "owner", "createProduct"] })
    .ifFileBelongsToShop();

  /*
   * Users with the "admin" or "owner" role may update and
   * remove their shop but may not insert one.
   */

  Shops.permit(["update", "remove"])
    .ifHasRoleForActiveShop({ role: ["admin", "owner", "shopSettings"] })
    .ifShopIdMatchesThisId()
    .allowInClientCode();

  /*
   * Users with the "admin" or "owner" role may update and
   * remove products, but createProduct allows just for just a product editor
   */

  Products.permit(["insert", "update", "remove"])
    .ifHasRoleForActiveShop({ role: ["createProduct"] })
    .ifShopIdMatches()
    .allowInClientCode();

  /*
   * Users with the "owner" role may remove orders for their shop
   */

  Orders.permit("remove")
    .ifHasRoleForActiveShop({ role: ["admin", "owner"] })
    .ifShopIdMatches()
    .exceptProps(["shopId"])
    .allowInClientCode();

  /*
   * Users may update their own account
   */
  Collections.Accounts.permit(["insert", "update"])
    .ifHasRoleForActiveShop({ role: ["anonymous", "guest"] })
    .ifUserIdMatches()
    .allowInClientCode();

  /**
   * Emails - Deny all client side ops
   */
  Emails.deny({
    insert: () => true,
    update: () => true,
    remove: () => true
  });
}
