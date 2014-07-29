Template.packagesGrid.helpers
  availablePkgs: ->
    availablePkgs = []
    for packageName, packageInfo of ReactionCore.Packages
      if !_.isFunction(packageInfo)
        unless packageInfo.hidden is true
          availablePkgs.push(packageInfo)
    availablePkgs