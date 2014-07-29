Template.packagePanel.helpers
  dependencies: ->
    currentPackageDepends = @depends
    dependencies = []
    Packages.find().forEach (packageConfig) ->
      packageInfo = ReactionCore.Packages[packageConfig.name]
      if _.intersection(currentPackageDepends, packageInfo?.provides).length
        if packageInfo.hidden is true
          dependencies.push(_.extend(packageConfig, packageInfo))
    dependencies

  widgetTemplateRender: (template)->
    data = Shops.findOne ReactionCore.getShopId()
    Template[template]

