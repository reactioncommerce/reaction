Template.loginDropdown.events({
  "click .dropdown-menu": function(event) {
    return event.stopPropagation();
  },

  "click #logout": function(event, template) {
    Session.set('displayConsoleNavBar', false);
    Meteor.logoutOtherClients();
    Meteor.logout(function(error, result) {
      if (error) {
        ReactionCore.Log.warn('Failed to logout.', error);
        return Meteor._debug(error);
      }
    });
    event.preventDefault();

    template.$('.dropdown-toggle').dropdown('toggle');
  },

  "click .user-accounts-dropdown-apps a": function(event, template) {
    if (this.route === "createProduct") {
      event.preventDefault();
      event.stopPropagation();

      Meteor.call("products/createProduct", function(error, productId) {
        var currentTag, currentTagId;
        if (error) {
          throw new Meteor.Error("createProduct error", error);
        } else if (productId) {
          currentTagId = Session.get("currentTag");
          currentTag = ReactionCore.Collections.Tags.findOne(currentTagId);
          if (currentTag) {
            Meteor.call("products/updateProductTags", productId, currentTag.name, currentTagId);
          }
          Router.go("product", {
            _id: productId
          });
        }
      });

    } else if (this.route) {
      event.preventDefault();
      template.$('.dropdown-toggle').dropdown('toggle');

      return Router.go(this.route);
    }
  }
});
