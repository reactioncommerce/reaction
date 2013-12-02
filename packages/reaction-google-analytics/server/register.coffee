Meteor.startup ->
  console.log "Adding Google Analytics to packages"
  result = PackageConfigs.upsert(
    name: "reaction-google-analytics"
  ,
    $set:
      label: "Google Analytics"
      description: ""
      icon: "fa fa-eye fa-5x"
      route: "googleAnalytics"
      template: "googleAnalytics"
      priority: "4"
  )
  if result.insertedId
    PackageConfigs.update result.insertedId,
      $set:
        metafields: [
          {
            name: "property"
            value: ""
          }
        ]

