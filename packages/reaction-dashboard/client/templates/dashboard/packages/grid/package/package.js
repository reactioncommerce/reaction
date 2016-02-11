/**
 * gridPackage events
 *
 */

Template.gridPackage.events({
  "click .enablePkg": function (event, template) {
    const self = this;
    event.preventDefault();
    return ReactionCore.Collections.Packages.update(template.data.packageId, {
      $set: {
        enabled: true
      }
    }, function (error, result) {
      if (result === 1) {
        Alerts.toast(self.label + i18n.t("gridPackage.pkgEnabled"), "error", {
          type: "pkg-enabled-" + self.name
        });
        if (self.route) {
          return ReactionRouter.go(ReactionRouter.pathFor(self.route));
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

  "click [data-event-action=showPackageManagement]": function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.route) {
      if (this.route) {
        // we're not using the route, but (pkg) name + provides
        // which we've defined as the true route name
        ReactionRouter.go(ReactionRouter.pathFor(this.route));
      } else if (ReactionCore.hasPermission(this.route, Meteor.userId())) {
        ReactionCore.showActionView(this);
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
