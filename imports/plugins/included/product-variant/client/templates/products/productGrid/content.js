import { Reaction } from "/client/api";

/**
 * gridContent helpers
 */

Template.gridContent.helpers({
  pdpPath() {
    const instance = Template.instance();
    const product = instance.data;

    if (product) {
      let handle = product.handle;

      if (product.__published) {
        handle = product.__published.handle;
      }

      return Reaction.Router.pathFor("product", {
        hash: {
          handle
        }
      });
    }

    return "/";
  },
  displayPrice: function () {
    if (this.price && this.price.range) {
      return this.price.range;
    }
  }
});
