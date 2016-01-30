packages = Router.group({
  name: "packages"
});

/**
 * registerPackageLayouts
 * registers route and template when registry item has
 * registryItem.route && registryItem.template
 * @returns {undefined} returns undefined
 */
registerPackageLayouts = () => {
  const pkgs = ReactionCore.Collections.Packages.find().fetch();
  for (let pkg of pkgs) {
    for (let registryItem of pkg.registry) {
      if (registryItem.route && registryItem.template) {
        if (registryItem.route.substr(0, 1) !== "/") {
          registryItem.route = `/${registryItem.route}`;
        }
        // console.log(registryItem);
        packages.route(registryItem.route, {
          name: registryItem.route.replace("/", ""),
          action: (context) => {
            renderLayout({
              template: registryItem.template
            });
          }
        });
      }
    }
  }
};

Meteor.startup(function () {
  registerPackageLayouts();
});
