/**
 *  ReactionRegistry.loadPackages
 *  insert Reaction packages into registry
 *  we check to see if the number of packages have changed against current data
 *  if there is a change, we'll either insert or upsert package registry
 *  into the Packages collection
 *  import is processed on hook in ReactionCore.init
 *  @return {String} returns insert result
 */
ReactionRegistry.loadPackages = function () {
  const shopCount = ReactionCore.Collections.Shops.find().count();
  const regCount = Object.keys(ReactionRegistry.Packages).length;
  const pkgCount = ReactionCore.Collections.Packages.find().count();

  //
  // checking the package count to see if registry has changed
  //
  if (pkgCount !== shopCount * regCount) {
    // for each shop, we're loading packages a unique registry
    _.each(ReactionRegistry.Packages, (config, pkgName) => {
      return ReactionCore.Collections.Shops.find().forEach((shop) => {
        let shopId = shop._id;
        if (!shopId) return [];
        // existing registry will be upserted with changes, perhaps we should add:
        ReactionRegistry.assignOwnerRoles(shopId, pkgName, config.registry);
        ReactionImport.package({
          name: pkgName,
          icon: config.icon,
          enabled: !!config.autoEnable,
          settings: config.settings,
          registry: config.registry,
          layout: config.layout
        }, shopId);
        ReactionCore.Log.info(`Initializing ${shop.name} ${pkgName}`);
      });
    });
    //
    // package cleanup
    //
    ReactionCore.Collections.Shops.find().forEach((shop) => {
      return ReactionCore.Collections.Packages.find().forEach((pkg) => {
        // delete registry entries for packages that have been removed
        if (!_.has(ReactionRegistry.Packages, pkg.name)) {
          ReactionCore.Log.info(`Removing ${pkg.name}`);
          return ReactionCore.Collections.Packages.remove({
            shopId: shop._id,
            name: pkg.name
          });
        }
      });
    });
  }
};
