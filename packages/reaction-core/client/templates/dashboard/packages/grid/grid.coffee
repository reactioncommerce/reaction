Template.packagesGrid.helpers
  pkgPermissions: () ->
    if ReactionCore.hasPermission 'dashboard'
      if @.route
        return ReactionCore.hasPermission @.route
      else
        return ReactionCore.hasPermission @.name
    else
      return false
