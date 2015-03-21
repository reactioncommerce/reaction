Router.map ->
  @route "social",
    controller: ShopAdminController
    path: 'dashboard/settings/social'
    template: 'socialDashboard'
    waitOn: ->
      return ReactionCore.Subscriptions.Packages
