import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
/* eslint no-loop-func: 0 */

/**
 * gridPackage helpers
 */
Template.gridPackage.helpers({
  /**
   * Properties for the card
   * @see packages/reaction-ui/client/components/cards/cards.js
   * @return {CardProps} Object of properties for the card component
   */
  cardProps() {
    const instance = Template.instance();
    const { data } = instance;
    const apps = Reaction.Apps({
      provides: "settings",
      name: data.package.packageName
    });

    const controls = [];

    if (data.package.priority > 1) {
      controls.push({
        icon: "fa fa-plus-square fa-fw",
        onIcon: "fa fa-check-square fa-fw",
        toggle: true,
        toggleOn: data.package.enabled,
        onClick() {
          if (instance.data.enablePackage) {
            instance.data.enablePackage(data.package, !data.package.enabled);
          }
        }
      });
    }

    for (const app of apps) {
      controls.push({
        icon: app.icon || "fa fa-cog fa-fw",
        onClick() {
          Reaction.pushActionView(app);
        }
      });
    }

    if (data.package.route) {
      controls.push({
        icon: "angle-right",
        onClick() {
          Reaction.pushActionView(data.package);
        }
      });
    }

    return {
      controls,
      onContentClick() {
        Reaction.pushActionView(data.package);
      }
    };
  },

  showPackageManagementEvent(pkg) {
    if (pkg.name && pkg.route && pkg.template) {
      return "showPackageManagement";
    }
  }
});
