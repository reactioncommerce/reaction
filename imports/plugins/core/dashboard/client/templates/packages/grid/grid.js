import _ from "lodash";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";

function pkgPermissions(pkg) {
  // if (Reaction.hasPermission("dashboard")) {
  //   // route specific permissions
  //   if (pkg.name) {
  //     return Reaction.hasPermission(pkg.name);
  //   }
  //   // name is a global group role for packages
  //   if (pkg.template) {
  //     return Reaction.hasPermission(pkg.template);
  //   }
  // }
  return Reaction.hasPermission(pkg.name);
}

function enableReactionPackage(reactionPackage) {
  const self = reactionPackage;

  Meteor.call("shop/togglePackage", self.packageId, false, (error, result) => {
    if (result === 1) {
      Alerts.toast(
        i18next.t(
          "gridPackage.pkgEnabled",
          { app: i18next.t(self.i18nKeyLabel) }
        ),
        "error", {
          type: `pkg-enabled-${self.name}`
        }
      );
      if (self.name || self.route) {
        const route = self.name || self.route;
        return Reaction.Router.go(route);
      }
    } else if (error) {
      return Alerts.toast(
        i18next.t(
          "gridPackage.pkgDisabled",
          { app: i18next.t(self.i18nKeyLabel) }
        ),
        "warning"
      );
    }
  });
}

function disableReactionPackage(reactionPackage) {
  const self = reactionPackage;

  if (self.name === "core") {
    return;
  }

  Alerts.alert(
    "Disable Package",
    i18next.t("gridPackage.disableConfirm", { app: i18next.t(self.i18nKeyLabel) }),
    {
      type: "warning",
      showCancelButton: true
    },
    () => {
      Meteor.call("shop/togglePackage", self.packageId, true, (error, result) => {
        if (result === 1) {
          return Alerts.toast(
            i18next.t("gridPackage.pkgDisabled", {
              app: i18next.t(self.i18nKeyLabel)
            }),
            "success"
          );
        } else if (error) {
          throw new Meteor.Error("error-disabling-package", error);
        }
      });
    }
  );
}

Template.packagesGrid.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    groups: [],
    appsByGroup: {},
    apps: []
  });

  this.autorun(() => {
    const apps = Reaction.Apps({ provides: "dashboard", enabled: true });
    const groupedApps = _.groupBy(apps, (app) => app.container || "misc");
    this.state.set("apps", apps);
    this.state.set("appsByGroup", groupedApps);
    this.state.set("groups", Object.keys(groupedApps));
  });
});

/**
 * packagesGrid helpers
 */
Template.packagesGrid.helpers({
  groups() {
    return Template.instance().state.get("groups");
  },

  appsInGroup(groupName) {
    const group = Template.instance().state.get("appsByGroup") || {};
    return group[groupName] || false;
  },

  shopId() {
    return Reaction.getShopId();
  },


  pkgPermissions
});

Template.packagesGridGroup.helpers({
  pkgPermissions,

  packageProps(app) {
    return {
      package: app,
      enablePackage(reactionPackage, value) {
        if (value === true) {
          enableReactionPackage(reactionPackage);
        } else {
          disableReactionPackage(reactionPackage);
        }
      }
    };
  }
});
