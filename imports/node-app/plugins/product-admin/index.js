import i18n from "./i18n/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Product Admin",
    name: "reaction-product-admin",
    i18n,
    registry: [
      // `ProductAdmin` is a role that currently clones the `createProduct` role
      // which is overused in too many places. By adding  `ProductAdmin`, we can use
      // that as a catch all wherever `createProduct` was used, and slowly remove `createProduct`
      // from places where it doesn't make sense
      {
        route: "product/admin",
        label: "Product Admin",
        permission: "productAdmin",
        name: "product/admin"
      },
      {
        route: "product/archive",
        label: "Archive Product",
        permission: "productArchive",
        name: "product/archive"
      },
      {
        route: "product/clone",
        label: "Clone Product",
        permission: "productClone",
        name: "product/clone"
      },
      {
        route: "product/create",
        label: "Create Product",
        permission: "productCreate",
        name: "product/create"
      },
      {
        route: "product/publish",
        label: "Publish Product",
        permission: "productPublish",
        name: "product/publish"
      },
      {
        route: "product/update",
        label: "Update Product",
        permission: "productUpdate",
        name: "product/update"
      }
    ]
  });
}
