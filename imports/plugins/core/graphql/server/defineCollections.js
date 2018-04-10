/**
 * @param {MongoDatabase} db A database instance from Node Mongo client
 * @param {Object} collections An object to mutate with all of the Reaction collections
 */
export default function defineCollections(db, collections) {
  Object.assign(collections, {
    Accounts: db.collection("Accounts"),
    AnalyticsEvents: db.collection("AnalyticsEvents"),
    Assets: db.collection("Assets"),
    Cart: db.collection("Cart"),
    Catalog: db.collection("Catalog"),
    Emails: db.collection("Emails"),
    Groups: db.collection("Groups"),
    Inventory: db.collection("Inventory"),
    Logs: db.collection("Logs"),
    MediaRecords: db.collection("MediaRecords"),
    Notifications: db.collection("Notifications"),
    Orders: db.collection("Orders"),
    Packages: db.collection("Packages"),
    Products: db.collection("Products"),
    Revisions: db.collection("Revisions"),
    roles: db.collection("roles"),
    SellerShops: db.collection("SellerShops"),
    Shipping: db.collection("Shipping"),
    Shops: db.collection("Shops"),
    Sms: db.collection("Sms"),
    Tags: db.collection("Tags"),
    Templates: db.collection("Templates"),
    Themes: db.collection("Themes"),
    Translations: db.collection("Translations"),
    users: db.collection("users")
  });
}
