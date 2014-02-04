Meteor.app = _.extend(Meteor.app || {},
  packages:
    register: (packageInfo) ->
      @[packageInfo.name] = packageInfo
)
