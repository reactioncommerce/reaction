packages = Router.group({
  prefix: "/dashboard",
  name: "packages"
});

const pkgs = ReactionCore.Collections.Packages.find().fetch();

for (let pkg of pkgs) {
  for (let registryItem of pkg.registry) {
    if (registryItem.route) {
      if (registryItem.route.substr(0, 1) !== "/") {
        registryItem.route = `/${registryItem.route}`;
      }
      // console.log(registryItem);
      packages.route(registryItem.route, {
        name: registryItem.route,
        action: (context) => {
          renderLayout(context, "coreAdminLayout", "coreLayout", {template: registryItem.template});
        }
      });
    }
  }
}
