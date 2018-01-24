import { Reaction } from "/client/api";
import { Tags } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
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
              let currentTag;
              let currentTagId;

              if (error) {
                throw new Meteor.Error("create-product-error", error);
              } else if (productId) {
                currentTagId = Session.get("currentTag");
                currentTag = Tags.findOne(currentTagId);
                if (currentTag) {
                  Meteor.call("products/updateProductTags", productId, currentTag.name, currentTagId);
                }
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
