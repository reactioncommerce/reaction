Router.map ->
  @route 'paypal',
    controller: ShopAdminController
    path: 'dashboard/settings/paypal',
    template: 'paypal'
    waitOn: ->
      PackagesHandle