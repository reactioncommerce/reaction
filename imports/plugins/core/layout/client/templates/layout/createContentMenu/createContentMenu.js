import { Reaction } from "/client/api";
import ReactionError from "@reactioncommerce/reaction-error";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

Template.createContentMenu.helpers({
  buttonProps(item) {
    return {
      label: item.label,
      i18nKeyLabel: item.i18nKeyLabel,
      status: "default",
      onClick() {
        // TODO: Move this to somewhere better, like, core or product package
        if (item.route === "/products/createProduct") {
          Meteor.call("products/createProduct", (error, productId) => {
            if (Meteor.isClient) {
              if (error) {
                throw new ReactionError("create-product-error", error);
              }

              if (productId) {
                // go to new product
                Reaction.Router.go("product", {
                  handle: productId
                });
              }
            }
          });
        }
      }
    };
  },

  items() {
    const apps = Reaction.Apps({ provides: "shortcut", container: "addItem" }) || [];
    return apps;
  }
});
