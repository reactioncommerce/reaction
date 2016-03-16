/* eslint no-loop-func: 0 */

/**
 * Navigate to package
 * @param  {Object} reactionPackage Reaction package definition
 * @return {Boolean} false if navigation was blocked
 */
function showPackageDashboard(reactionPackage) {
  const route = reactionPackage.name || reactionPackage.route;

  if (route && ReactionCore.hasPermission(route, Meteor.userId())) {
    ReactionRouter.go(route);
    return true;
  }

  return false;
}

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
    const data = instance.data;
    const apps = ReactionCore.Apps({
      provides: "settings",
      name: data.package.packageName
    });

    let controls = [];

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

    for (let app of apps) {
      controls.push({
        icon: app.icon || "fa fa-cog fa-fw",
        onClick() {
          ReactionCore.showActionView(app);
        }
      });
    }

    if (data.package.route) {
      controls.push({
        icon: "angle-right",
        onClick() {
          showPackageDashboard(data.package);
        }
      });
    }

    return {
      controls,
      onContentClick() {
        showPackageDashboard(data.package);
      }
    };
  },

  showPackageManagementEvent(pkg) {
    if (pkg.name && pkg.route && pkg.template) {
      return "showPackageManagement";
    }
  }
});
