/**
 * gridPackage helpers
 */
Template.gridPackage.helpers({
  cardProps() {
    const instance = Template.instance();
    const data = instance.data;
    const apps = ReactionCore.Apps({
      provides: "settings",
      name: data.package.packageName
    });

    let controls = [];

    if (data.package.enabled === true && data.package.priority > 1) {
      controls.push({
        icon: "fa fa-check-square fa-fw",
        onClick() {
          console.log("enable / disable package");
        }
      })
    }

    for (let app in apps) {
      controls.push({
        icon: app.icon || "fa fa-cog fa-fw",
      })
    }

    if (data.package.route) {
      controls.push({
        icon: "angle-right",
        onClick() {
          const route = data.package.name || data.package.route;
          ReactionRouter.go(route);
        }
      });
    }

    return {
      controls
    }
  },

  showDashboardButtonProps(pkg) {
    return {
      icon: "angle-right",
      onClick() {
        const route = pkg.name || pkg.route;
        ReactionRouter.go(route);
      }
    };
  },
  showPackageManagement(pkg) {
    if (pkg.name && pkg.route && pkg.template) {
      return "showPackageManagement";
    }
  }
});

/**
 * gridPackage events
 */
Template.gridPackage.events({
  "click .enablePkg": function (event/* , template */) {
    const self = this.package;
    event.preventDefault();
    Meteor.call("shop/togglePackage", self.packageId, false,
      (error, result) => {
        if (result === 1) {
          Alerts.toast(
            i18n.t(
              "gridPackage.pkgEnabled",
              { app: i18n.t(self.i18nKeyLabel) }
            ),
            "error", {
              type: "pkg-enabled-" + self.name
            }
          );
          if (self.name || self.route) {
            const route = self.name || self.route;
            return ReactionRouter.go(route);
          }
        } else if (error) {
          return Alerts.toast(
            i18n.t(
              "gridPackage.pkgDisabled",
              { app: i18n.t(self.i18nKeyLabel) }
            ),
            "warning"
          );
        }
      }
    );
  },
  "click .disablePkg": function (event/* , template */) {
    event.preventDefault();

    const self = this.package;
    if (self.name === "core") {
      return;
    }

    Alerts.alert(
      "Disable Package",
      i18n.t("gridPackage.disableConfirm", { app: i18n.t(self.i18nKeyLabel) }),
      { type: "warning" },
      () => {
        Meteor.call("shop/togglePackage", self.packageId, true,
          (error, result) => {
            if (result === 1) {
              return Alerts.toast(
                i18n.t("gridPackage.pkgDisabled", {
                  app: i18n.t(self.i18nKeyLabel)
                }),
                "success"
              );
            } else if (error) {
              throw new Meteor.Error("error disabling package", error);
            }
          }
        );
      });
  },

  "click [data-event-action=showPackageManagement]": function (event, instance) {
    event.preventDefault();
    event.stopPropagation();

    const packageData = instance.data.package || {};
    const route = ReactionRouter.path(packageData.name || packageData.route);
    if (route) {
      if (ReactionCore.hasPermission(route, Meteor.userId())) {
        ReactionRouter.go(route);
      }
    }
  },

  "click .pkg-settings, click [data-event-action=showPackageSettings]": function (event) {
    event.preventDefault();
    event.stopPropagation();
    // Show the advanced settings view using this package registry entry
    ReactionCore.showActionView(this);
  }
});
