const merge = Npm.require("lodash.merge");
const uniqWith = Npm.require("lodash.uniqwith");
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
  let settingsJSONAsset;
  let settingsFromJSON;
  const packages = ReactionCore.Collections.Packages.find({}).fetch();

  // Attempt to load reaction.json fixture data
  try {
    settingsJSONAsset = AppAssets.getText("settings/reaction.json");
    const validatedJson = EJSON.parse(settingsJSONAsset);

    if (!_.isArray(validatedJson[0])) {
      ReactionCore.Log.warn("Load Settings is not an array. Failed to load settings.");
    } else {
      settingsFromJSON = validatedJson;
    }
  } catch (error) {
    ReactionCore.Log.warn("loadSettings reaction.json not loaded.", error);
  }
  let layouts = [];
  // for each shop, we're loading packages a unique registry
  _.each(ReactionRegistry.Packages, (config, pkgName) => {
    return ReactionCore.Collections.Shops.find().forEach((shop) => {
      let shopId = shop._id;

      if (!shopId) return [];
      // existing registry will be upserted with changes, perhaps we should add:
      ReactionRegistry.assignOwnerRoles(shopId, pkgName, config.registry);

      // Settings from the package registry.js
      const settingsFromPackage = {
        name: pkgName,
        icon: config.icon,
        enabled: !!config.autoEnable,
        settings: config.settings,
        registry: config.registry,
        layout: config.layout
      };

      // Setting from a fixture file, most likely reaction.json
      let settingsFromFixture;
      if (settingsFromJSON) {
        settingsFromFixture = _.find(settingsFromJSON[0], (packageSetting) => {
          return config.name === packageSetting.name;
        });
      }

      // Setting already imported into the packages collection
      const settingsFromDB = _.find(packages, (ps) => {
        if (config.name === ps.name && shopId === ps.shopId) {
          return true;
        }
      });

      const combinedSettings = merge({},
        settingsFromPackage,
        settingsFromFixture || {},
        settingsFromDB || {}
      );

      // populate array of layouts that
      // don't already exist in Shops
      if (combinedSettings.layout) {
        // filter out layout Templates
        for (let pkg of combinedSettings.layout) {
          if (pkg.layout) {
            layouts.push(pkg);
          }
        }
      }
      // Import package data
      ReactionImport.package(combinedSettings, shopId);
      ReactionCore.Log.info(`Initializing ${shop.name} ${pkgName}`);
    }); // end shops
  });

  // helper for removing layout duplicates
  const uniqLayouts = uniqWith(layouts, _.isEqual);
  // import layouts into Shops
  ReactionCore.Collections.Shops.find().forEach((shop) => {
    ReactionImport.layout(uniqLayouts, shop._id);
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
};
