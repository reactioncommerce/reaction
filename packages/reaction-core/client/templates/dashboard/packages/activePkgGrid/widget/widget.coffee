Template.widget.helpers
  dependencies: ->
    currentPackageDepends = @depends
    dependencies = []
    Packages.find().forEach (packageConfig) ->
      packageInfo = Meteor.app.packages[packageConfig.name]
      if _.intersection(currentPackageDepends, packageInfo.provides).length
        dependencies.push(_.extend(packageConfig, packageInfo))
    dependencies

Template.widget.rendered = ->

Template.widget.events {}
