const Drop = ReactionUI.Lib.Drop;

Template.coreAdminLayout.onCreated(function () {
});

Template.coreAdminLayout.onRendered(function () {
  $("body").addClass("admin");
});

Template.coreAdminLayout.onDestroyed(() => {
  $("body").removeClass("admin");
});

Template.coreAdminLayout.helpers({
  shortcutButtons() {
    const instance = Template.instance();
    const shortcuts = ReactionCore.Apps({
      provides: "shortcut",
      enabled: true,
      container: undefined
    });

    let items = [];

    if (_.isArray(shortcuts)) {
      for (let shortcut of shortcuts) {
        items.push({
          type: "link",
          href: ReactionRouter.pathFor(shortcut.name),
          className: ReactionRouter.isActiveClassName(shortcut.name),
          icon: shortcut.icon,
          tooltip: i18next.t(shortcut.i18nKeyLabel, shortcut.i18n),
          tooltipPosition: "left middle"
        });
      }
    }

    items.push({
      type: "seperator"
    });

    items.push({
      icon: "plus",
      tooltip: i18next.t("app.createContent", "Create Content"),
      tooltipPosition: "left middle",
      onClick(event) {
        if (!instance.dropInstance) {
          instance.dropInstance = new Drop({
            target: event.currentTarget,
            content: "",
            constrainToWindow: true,
            classes: "drop-theme-arrows",
            position: "right center"
          });

          Blaze.renderWithData(Template.createContentMenu, {}, instance.dropInstance.content);
        }

        instance.dropInstance.open();
      }
    });

    items.push({
      icon: "edit",
      tooltip: i18next.t("app.toggleEditMode", "Toggle Edit Mode"),
      tooltipPosition: "left middle",
      onClick() {
        if (Session.equals("reaction/editModeEnabled", true)) {
          Session.set("reaction/editModeEnabled", false);
        } else {
          Session.set("reaction/editModeEnabled", true);
        }
      }
    });

    return items;
  },

  isSeperator(props) {
    if (props.type === "seperator") {
      return true;
    }
    return false;
  },

  // shortcutButtonProps(data) {
  //   return {
  //     type: "link",
  //     href: data.route,
  //     // label: data.label,
  //     // i18nLabel: data.i18nKeyLabel,
  //     //active
  //     icon: data.icon,
  //     tooltip: i18next.t(data.i18nKeyLabel, data.i18n),
  //     tooltipPosition: "left middle"
  //   }
  // },

  packageButtons() {
    const routeName = ReactionRouter.getRouteName();

    if (routeName !== "dashboard") {
      const registryItems = ReactionCore.Apps({provides: "settings", container: routeName});
      let buttons = [];

      for (let item of registryItems) {
        if (ReactionCore.hasPermission(item.route, Meteor.userId())) {
          let icon = item.icon;

          if (!item.icon && item.provides === "settings") {
            icon = "gear";
          }

          buttons.push({
            href: item.route,
            icon: icon,
            tooltip: i18next.t(item.i18nKeyLabel, item.i18n),
            tooltipPosition: "left middle",
            onClick() {
              ReactionCore.showActionView(item);
            }
          });
        }
      }

      return buttons;
    }
  },

  control: function () {
    return ReactionCore.getActionView();
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
