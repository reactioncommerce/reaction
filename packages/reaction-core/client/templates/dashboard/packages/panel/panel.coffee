Template.packagePanel.helpers
  dependencies: ->
    currentPackageDepends = @depends
    dependencies = []
    ReactionCore.Collections.Packages.find(enabled: true).forEach (p) ->
      packageInfo = p.info()
      if _.intersection(currentPackageDepends, packageInfo?.provides).length
        if packageInfo.hidden is true
          dependencies.push _.extend(p, packageInfo)
    return dependencies

  widgetTemplateRender: (template)->
    data = Shops.findOne ReactionCore.getShopId()
    Template[template]
