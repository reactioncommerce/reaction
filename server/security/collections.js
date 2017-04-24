import * as Collections from "/lib/collections";
import { Reaction } from "/lib/api";
import { Hooks } from "/server/api";

const {
  Accounts,
  Cart,
  Packages,
  Emails,
  Jobs,
  Media,
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
  // Replace ifHasRole with this to check seller/shop relationship
  Security.defineMethod("ifHasSellerRole", {
    fetch: [],
    deny: function (type, arg, userId) {
      const isDenied = !Roles.userIsInRole(userId, "createProduct", Reaction.getSellerShopId(userId));
      return isDenied;
    }
  });
  // use this rule for collections other than Shops
  // matches this.shopId
  Security.defineMethod("ifShopIdMatches", {
    fetch: [],
    deny: function (type, arg, userId, doc) {
      return doc.shopId !== Reaction.getSellerShopId(this.userId);
    }
  });
  // this rule is for the Shops collection
  // use ifShopIdMatches for match on this._id
  Security.defineMethod("ifShopIdMatchesThisId", {
    fetch: [],
    deny: function (type, arg, userId, doc) {
      return doc._id !== Reaction.getSellerShopId(userId);
    }
  });

  Security.defineMethod("ifFileBelongsToShop", {
    fetch: [],
    deny: function (type, arg, userId, doc) {
      // owner will always have access to this shop
      const isDenied = Roles.userIsInRole(userId, "createProduct", doc.metadata.shopId);
      if (!isDenied) {
        return false;
      }

      const shopId =  Reaction.getSellerShopId(userId);
      return doc.metadata.shopId !== shopId;
    }
  });

  Security.defineMethod("ifUserIdMatches", {
    fetch: [],
    deny: function (type, arg, userId, doc) {
      return userId && doc.userId && doc.userId !== userId || doc.userId && !userId;
    }
  });

  Security.defineMethod("ifUserIdMatchesProp", {
    fetch: [],
    deny: function (type, arg, userId, doc) {
      return doc[arg] !== userId;
    }
  });

  // todo do we need this?
  Security.defineMethod("ifSessionIdMatches", {
    fetch: [],
    deny: function (type, arg, userId, doc) {
      return doc.sessionId !== Reaction.sessionId;
    }
  });

  /**
   * Define all security rules
   */

  /**
   * admin security
   * Permissive security for users with the "admin" role
   */

  Security.permit(["insert", "update", "remove"]).collections([
    Accounts,
    Products,
    Tags,
    Translations,
    Shipping,
    Orders,
    Packages,
    Templates,
    Jobs
  ]).ifHasSellerRole()
    .ifShopIdMatches()
    .exceptProps(["shopId"])
    .allowInClientCode();

  /*
   * Users with the "admin" or "owner" role may update and
   * remove their shop but may not insert one.
   */

  Shops.permit(["insert", "update", "remove"])
    .ifHasSellerRole()
    .ifShopIdMatchesThisId()
    .allowInClientCode();

  /*
   * Users with the "admin" or "owner" role may update and
   * remove products, but createProduct allows just for just a product editor
   */

  Products.permit(["insert", "update", "remove"])
    .ifHasSellerRole()
    .ifShopIdMatches()
    .allowInClientCode();

  /*
   * Users with the "owner" role may remove orders for their shop
   */

  Orders.permit("remove")
    .ifHasSellerRole()
    .ifShopIdMatches()
    .exceptProps(["shopId"])
    .allowInClientCode();

  /*
   * Can update cart from client. Must insert/remove carts using
   * server methods.
   * Can update all session carts if not logged in or user cart if logged in as that user
   * XXX should verify session match, but doesn't seem possible? Might have to move all cart updates to server methods, too?
   */

  Cart.permit(["insert", "update", "remove"]).ifHasRole({
    role: ["anonymous", "guest"],
    group: Reaction.getShopId()
  }).ifShopIdMatches().ifUserIdMatches().ifSessionIdMatches().allowInClientCode();

  /*
   * Users may update their own account
   */
  Collections.Accounts.permit(["insert", "update"]).ifHasRole({
    role: ["anonymous", "guest"],
    group: Reaction.getShopId()
  }).ifUserIdMatches().allowInClientCode();

  /*
   * Permissive security for users with the "admin" role for FS.Collections
   */
  Security.permit(["insert", "update", "remove"]).collections([Media])
    .ifHasSellerRole()
    .ifFileBelongsToShop()
    .allowInClientCode();

  /*
   * apply download permissions to file collections
   */
  _.each([Media], function (fsCollection) {
    return fsCollection.allow({
      download: function () {
        return true;
      }
    });
  });

  /**
   * Emails - Deny all client side ops
   */
  Emails.deny({
    insert: () => true,
    update: () => true,
    remove: () => true
  });

  // As the above security Rules definitions happen after all known Core Initialization Event hooks,
  // a new Event hook is created by which other code can make use of these new Rules.
  Hooks.Events.run("afterSecurityInit");
}
