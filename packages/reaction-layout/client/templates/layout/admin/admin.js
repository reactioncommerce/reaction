Template.coreAdminLayout.onCreated(() => {
  const control = Template.instance();

  control.settings = new ReactiveVar();

  control.autorun(() => {
    let reactionApp = ReactionCore.Collections.Packages.findOne({
      "registry.provides": "settings",
      "registry.route": ReactionRouter.getRouteName()
    }, {
      enabled: 1,
      registry: 1,
      name: 1,
      route: 1
    });

    if (reactionApp) {
      let settingsData = _.find(reactionApp.registry, function (item) {
        return item.route === ReactionRouter.getRouteName() && item.provides === "settings";
      });

      // return settingsData;
      if (settingsData) {
        if (ReactionCore.hasPermission(settingsData.route, Meteor.userId())) {
          control.settings.set(settingsData);
        } else {
          control.settings.set(null);
        }
      } else {
        control.settings.set(null);
      }
    } else {
      control.settings.set(null);
    }
  });
});

Template.coreAdminLayout.onRendered(() => {
  $("body").addClass("admin");
});

Template.coreAdminLayout.onDestroyed(() => {
  $("body").removeClass("admin");
});

Template.coreAdminLayout.helpers({
  control: function () {
    return ReactionCore.getActionView();
  },

  settings: function () {
    return Template.instance().settings.get();
  },

  isDashboard(route) {
    if (route === "dashboard") {
      return true;
    }
    return false;
  },

  adminControlsClassname: function () {
    if (ReactionCore.isActionViewOpen()) {
      return "show-settings";
    }
    return "";
  },

  /**
   * thisApp
   * @return {Object} Registry entry for item
   */
  thisApp() {
    let reactionApp = ReactionCore.Collections.Packages.findOne({
      "registry.provides": "settings",
      "registry.route": ReactionRouter.getRouteName()
    }, {
      enabled: 1,
      registry: 1,
      name: 1,
      route: 1
    });

    if (reactionApp) {
      let settingsData = _.find(reactionApp.registry, function (item) {
        return item.route === ReactionRouter.getRouteName() && item.provides === "settings";
      });

      return settingsData;
    }
    return reactionApp;
  }
});

Template.coreAdminLayout.events({

  "click [data-event-action=toggleEditMode]"() {
    if (Session.equals("reaction/editModeEnabled", true)) {
      Session.set("reaction/editModeEnabled", false);
    } else {
      Session.set("reaction/editModeEnabled", true);
    }
  },

  "click [data-event-action=showPackageSettings]"() {
    ReactionCore.showActionView(this);
  },

  /**
   * Submit sign up form
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "click .user-accounts-dropdown-apps a, click .admin-controls-quicklinks button"(event) {
    if (this.route === "products/createProduct") {
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
          // go to new product
          ReactionRouter.go("product", {
            handle: productId
          });
        }
      });
    } else if (this.route) {
      event.preventDefault();
      event.stopPropagation();

      ReactionRouter.go(ReactionRouter.pathFor(this.route));
    }
  }
});
