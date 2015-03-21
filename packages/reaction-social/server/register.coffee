DefaultSocialApp =
  'profilePage': ''
  'enabled': false

ReactionCore.registerPackage
  name: 'reaction-social' # usually same as meteor package
  autoEnable: false # auto-enable in dashboard
  settings: # private package settings config (blackbox)
    public:
      autoInit: true
      apps:
        'facebook': _.extend({
            'appId': undefined
            'version': 'v2.1'
          }, DefaultSocialApp)
        'twitter': _.extend({
            'username': undefined
          }, DefaultSocialApp)
        'googleplus': _.extend({}, DefaultSocialApp)
        'pinterest': _.extend({}, DefaultSocialApp)
      appsOrder: ['facebook', 'twitter', 'pinterest', 'googleplus']
      iconOnly: true
      faSize: 'fa-2x'
      faClass: 'square'
      targetWindow: '_self'
  registry: [
    # all options except route and template
    # are used to describe the
    # dashboard 'app card'.
    {
      provides: 'dashboard'
      label: 'Social'
      description: "Social Sharing for Reaction Commerce"
      icon: 'fa fa-share-alt' # glyphicon/fa
      cycle: '4' # Core, Stable, Testing (currently testing)
      container: 'dashboard'  #group this with settings
    }
    # configures settings link for app card
    # use 'group' to link to dashboard card
    {
      route: 'social'
      template: 'socialDashboard'
      provides: 'settings'
      container: 'dashboard'
    }
    # Social widget for product detail page
    {
      template: 'reactionSocial'
      provides: 'social'
    }
  ]
  # array of permission objects
  permissions: [
    {
      label: "Social"
      permission: "dashboard/social"
      group: "Shop Settings"
    }
  ]
