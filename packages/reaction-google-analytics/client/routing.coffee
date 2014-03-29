Router.map ->
  @route 'dashboard/settings/google',
    controller: ShopAdminController
    path: 'dashboard/settings/google',
    template: 'googleAnalytics'

Router.onAfterAction ->
  ga("send", "pageview", IronLocation.get().pathname)
