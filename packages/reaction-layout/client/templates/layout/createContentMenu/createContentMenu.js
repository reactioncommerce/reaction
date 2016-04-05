
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
                throw new Meteor.Error("createProduct error", error);
              } else if (productId) {
                currentTagId = Session.get("currentTag");
                currentTag = ReactionCore.Collections.Tags.findOne(currentTagId);
                if (currentTag) {
                  Meteor.call("products/updateProductTags", productId, currentTag.name, currentTagId);
                }
                // go to new product
                ReactionRouter.go("product", {
                  handle: productId
                });
              }
            }
          });
        } else if (item.route === "/pages/createPage") {
          Meteor.call("ReactionFlatPages.methods.createPage", (error, pageId) => {
            if (Meteor.isClient) {
              if (error) {
                throw new Meteor.Error("createProduct error", error);
              } else if (pageId) {
                // go to new page
                ReactionRouter.go("page", {
                  handle: pageId
                });
              }
            }
          });
        }
      }
    };
  },

  items() {
    const apps = ReactionCore.Apps({provides: "shortcut", container: "addItem"}) || [];
    return apps;
  }
});
