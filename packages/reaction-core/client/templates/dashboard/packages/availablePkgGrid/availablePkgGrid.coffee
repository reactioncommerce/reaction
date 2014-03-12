Template.availablePkgGrid.helpers
  availablePkgs: ->
    availablePkgs = []
    for packageName, packageInfo of Meteor.app.packages
      if !_.isFunction(packageInfo)
        unless packageInfo.hidden is true
          availablePkgs.push(packageInfo)
    console.log availablePkgs
    availablePkgs