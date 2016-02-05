Template.loginDropdown.events({

  /**
   * Submit sign up form
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "click .dropdown-menu": (event) => {
    return event.stopPropagation();
  },

  /**
   * Submit sign up form
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "click #logout": (event, template) => {
    event.preventDefault();
    template.$(".dropdown-toggle").dropdown("toggle");
    // Meteor.logoutOtherClients();
    Meteor.logout((error) => {
      if (error) {
        ReactionCore.Log.warn("Failed to logout.", error);
      }
      // go home on logout
      ReactionRouter.go("/");
    });
  },

  /**
   * Submit sign up form
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "click .user-accounts-dropdown-apps a": function (event, template) {
    if (this.route === "createProduct") {
      event.preventDefault();
      event.stopPropagation();

      Meteor.call("products/createProduct", (error, productId) => {
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
          ReactionRouter.go("product", {
            handle: productId
          });
        }
      });
    } else if (this.route) {
      let path = ReactionRouter.path(this.route);
      event.preventDefault();
      template.$(".dropdown-toggle").dropdown("toggle");
      ReactionRouter.go(path);
    }
  }
});
