###
#
# reactionApps
#
#   provides="<where matching registry provides is this >"
#   enabled=true <false for disabled packages>
#   context= true filter templates to current route
#
# returns matching package registry objects
#
#  TODO:
#   - reintroduce a dependency context
#   - introduce position,zones #148
#   - is it better to get all packages once and filter in code
#     and possibly have some cache benefits down the road,
#     or to retrieve what is requested and gain the advantage of priviledged,
#     unnecessary data not retrieved with the cost of additional requests.
#   - context filter should be considered experimental
#
###
Template.registerHelper "reactionApps", (options) ->
  packageSubscription = Meteor.subscribe "Packages"

  if packageSubscription.ready()
    unless options.hash.shopId then options.hash.shopId = ReactionCore.getShopId()
    reactionApps = []
    filter = {}
    registryFilter = {}
    # any registry property, name, enabled can be used as filter
    for key, value of options.hash
      unless key is 'enabled' or key is 'name' or key is 'shopId'
        filter['registry.' + key] = value #for query
        registryFilter[key] = value #for registry filter
      else
        filter[key] = value #handle top level filters

    # we only need these fields (filtered for user, all available to admin)
    fields =
      'enabled': 1
      'registry': 1
      'name': 1

    # fetch filtered package
    reactionPackages = ReactionCore.Collections.Packages.find(filter, fields).fetch()

    # really, this shouldn't ever happen
    unless reactionPackages then throw new Error("Packages not loaded.")

    # filter packages
    # this isn't as elegant as one could wish, review, refactor?

    #  filter name and enabled as the package level filter
    if filter.name and filter.enabled
      packages = (pkg for pkg in reactionPackages when pkg.name is filter.name and pkg.enabled is filter.enabled)
    else if filter.name
      packages = (pkg for pkg in reactionPackages when pkg.name is filter.name)
    else if filter.enabled
      packages = (pkg for pkg in reactionPackages when pkg.enabled is filter.enabled)
    else
      packages = (pkg for pkg in reactionPackages)

    # filter and reduce, format registry objects
    # checks to see that all registry filters are applied to the registry objects
    # and pushes to reactionApps
    for app in packages
      for registry in app.registry
        match = 0
        for key, value of registryFilter
          if registry[key] is value
            match += 1
          if match is Object.keys(registryFilter).length
            registry.name = app.name
            # skip false registry entries, even if pkg is enabled
            unless registry.enabled is false
              registry.enabled = registry.enabled || app.enabled
              registry.packageId = app._id
              reactionApps.push registry

    #
    # TODO: add group by provides, sort by cycle, enabled
    #

    # make sure they are unique,
    # add priority for default sort
    reactionApps = _.uniq(reactionApps)
    for app, index in reactionApps
      reactionApps[index].priority = index unless app.priority
    # need to sort after?
    return reactionApps
