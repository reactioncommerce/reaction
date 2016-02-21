const Drop = ReactionUI.Lib.Drop;

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

Template.coreAdminLayout.onRendered(function () {
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

  "click [data-event-action=addItem]"() {
    if (!this.dropInstance) {
      this.dropInstance = new Drop({
        target: event.target,
        content: "",
        constrainToWindow: true,
        classes: "drop-theme-arrows",
        position: "right center"
      });

      Blaze.renderWithData(Template.createContentMenu, {}, this.dropInstance.content);
    }

    this.dropInstance.open();
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
  "click .admin-controls-quicklinks a, click .admin-controls-quicklinks button"(event) {
    if (this.name === "createProduct") {
      event.preventDefault();
      event.stopPropagation();

      if (!this.dropInstance) {
        this.dropInstance = new Drop({
          target: event.target,
          content: "",
          constrainToWindow: true,
          classes: "drop-theme-arrows",
          position: "right center"
        });

        Blaze.renderWithData(Template.createContentMenu, {}, this.dropInstance.content);
      }

      this.dropInstance.open();
    } else if (this.route) {
      event.preventDefault();
      event.stopPropagation();

      ReactionRouter.go(this.name);
    }
  }
});
