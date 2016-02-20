/**
 * gridPackage helpers
 */
Template.gridPackage.helpers({
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
  "click .enablePkg": function (event, template) {
    const self = this.package;
    event.preventDefault();
    return ReactionCore.Collections.Packages.update(self.packageId, {
      $set: {
        enabled: true
      }
    }, function (error, result) {
      if (result === 1) {
        Alerts.toast(self.label + i18n.t("gridPackage.pkgEnabled"), "error", {
          type: "pkg-enabled-" + self.name
        });
        if (self.name || self.route) {
          const route = self.name || self.route;
          return ReactionRouter.go(route);
        }
      } else if (error) {
        return Alerts.toast(self.label + i18n.t("gridPackage.pkgDisabled"), "warning");
      }
    });
  },
  "click .disablePkg": function (event, template) {
    event.preventDefault();

    let self = this;
    if (self.name === "core") {
      return;
    }

    Alerts.alert(
      "Disable Package",
      `Are tou sure you want to disable ${self.label}`,
      {type: "warning"},
      () => {
        ReactionCore.Collections.Packages.update(template.data.packageId, {
          $set: {
            enabled: false
          }
        }, function (error, result) {
          if (result === 1) {
            return Alerts.toast(self.label + i18n.t("gridPackage.pkgDisabled"), "success");
          } else if (error) {
            throw new Meteor.Error("error disabling package", error);
          }
        });
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
