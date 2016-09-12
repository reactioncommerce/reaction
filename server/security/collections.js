import * as Collections from "/lib/collections";
import { Reaction } from "/server/api";

const {
  Accounts,
  Cart,
  Packages,
  Discounts,
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
  // use this rule for collections other than Shops
  // matches this.shopId
  Security.defineMethod("ifShopIdMatches", {
    fetch: [],
    deny: function (type, arg, userId, doc) {
      return doc.shopId !== Reaction.getShopId();
    }
  });
  // this rule is for the Shops collection
  // use ifShopIdMatches for match on this._id
  Security.defineMethod("ifShopIdMatchesThisId", {
    fetch: [],
    deny: function (type, arg, userId, doc) {
      return doc._id !== Reaction.getShopId();
    }
  });

  Security.defineMethod("ifFileBelongsToShop", {
    fetch: [],
    deny: function (type, arg, userId, doc) {
      return doc.metadata.shopId !== Reaction.getShopId();
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
    Discounts,
    Shipping,
    Orders,
    Packages,
    Templates,
    Jobs
  ]).ifHasRole({
    role: "admin",
    group: Reaction.getShopId()
  }).ifShopIdMatches().exceptProps(["shopId"]).allowInClientCode();

  /*
   * Permissive security for users with the "admin" role for FS.Collections
   */

  Security.permit(["insert", "update", "remove"]).collections([Media]).ifHasRole({
    role: ["admin", "owner", "createProduct"],
    group: Reaction.getShopId()
  }).ifFileBelongsToShop().allowInClientCode();

  /*
   * Users with the "admin" or "owner" role may update and
   * remove their shop but may not insert one.
   */

  Shops.permit(["update", "remove"]).ifHasRole({
    role: ["admin", "owner"],
    group: Reaction.getShopId()
  }).ifShopIdMatchesThisId().allowInClientCode();

  /*
   * Users with the "admin" or "owner" role may update and
   * remove products, but createProduct allows just for just a product editor
   */

  Products.permit(["insert", "update", "remove"]).ifHasRole({
    role: ["createProduct"],
    group: Reaction.getShopId()
  }).ifShopIdMatches().allowInClientCode();

  /*
   * Users with the "owner" role may remove orders for their shop
   */

  Orders.permit("remove").ifHasRole({
    role: ["admin", "owner"],
    group: Reaction.getShopId()
  }).ifShopIdMatches().exceptProps(["shopId"]).allowInClientCode();

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
}
