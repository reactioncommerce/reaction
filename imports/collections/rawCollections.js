import { MongoInternals } from "meteor/mongo";
import { NoMeteorMedia } from "/imports/plugins/core/files/server";

const collections = { Media: NoMeteorMedia };

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

Object.assign(collections, {
  Accounts: db.collection("Accounts"),
  Cart: db.collection("Cart"),
  Catalog: db.collection("Catalog"),
  Discounts: db.collection("Discounts"),
  Emails: db.collection("Emails"),
  Groups: db.collection("Groups"),
  MediaRecords: db.collection("cfs.Media.filerecord"),
  NavigationItems: db.collection("NavigationItems"),
  NavigationTrees: db.collection("NavigationTrees"),
  Notifications: db.collection("Notifications"),
  Orders: db.collection("Orders"),
  Packages: db.collection("Packages"),
  Products: db.collection("Products"),
  roles: db.collection("roles"),
  SellerShops: db.collection("SellerShops"),
  Shops: db.collection("Shops"),
  Tags: db.collection("Tags"),
  Taxes: db.collection("Taxes"),
  TaxCodes: db.collection("TaxCodes"),
  Templates: db.collection("Templates"),
  Themes: db.collection("Themes"),
  Translations: db.collection("Translations"),
  users: db.collection("users")
});

export default collections;
