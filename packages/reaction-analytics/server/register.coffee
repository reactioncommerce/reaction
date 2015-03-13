ReactionCore.registerPackage
  name: 'reaction-analytics'
  autoEnable: false
  settings: # private package settings config (blackbox)
    api_key: "" # Tracking ID - using api_key to maintain compatability
  registry: [
    # all options except route and template
    # are used to describe the
    # dashboard 'app card'.
    {
      provides: 'dashboard'
      label: 'Reaction Analytics'
      description: "Event tracking and analytics with Reaction"
      icon: "fa fa-bar-chart-o" # glyphicon/fa
      cycle: '3' # Core, Stable, Testing (currently testing)
      container: 'dashboard'  #group this with settings
    }
    # configures settings link for app card
    # use 'group' to link to dashboard card
    # No Settings Yet
    # {
    #   route: 'reactionAnalytics'
    #   provides: 'settings'
    #   container: 'dashboard'
    # }
  ]
  # array of permission objects
  permissions: [
    {
      label: "Reaction Analytics"
      permission: "dashboard/settings"
      group: "Shop Settings"
    }
  ]
