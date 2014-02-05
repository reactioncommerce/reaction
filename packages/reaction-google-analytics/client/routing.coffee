Router.map ->
  @route 'googleAnalytics',
    controller: ShopAdminController
    path: 'dashboard/settings/google',
    template: 'googleAnalytics'

Router.after ->
  ga("send", "pageview", IronLocation.get().pathname)
