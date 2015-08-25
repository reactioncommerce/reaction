Template.loginDropdown.events({

  "click .dropdown-menu": function(event) {
    return event.stopPropagation();
  },

  "click #logout": function(event, template) {
    Session.set('displayConsoleNavBar', false);

    console.log('logout please')

    Meteor.logout(function(err) {

      console.log('should logout!!!', err)

      if (err) {
        return Meteor._debug(err);
      }
    });
    event.preventDefault();

    template.$('.dropdown-toggle').dropdown('toggle');
  },

  "click .user-accounts-dropdown-apps a": function(event, template) {
    if (this.route === "createProduct") {
      event.preventDefault();
      event.stopPropagation();

      Meteor.call("createProduct", function(error, productId) {
        var currentTag, currentTagId;
        if (error) {
          throw new Meteor.Error("createProduct error", error);
        } else if (productId) {
          currentTagId = Session.get("currentTag");
          currentTag = ReactionCore.Collections.Tags.findOne(currentTagId);
          if (currentTag) {
            Meteor.call("updateProductTags", productId, currentTag.name, currentTagId);
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
