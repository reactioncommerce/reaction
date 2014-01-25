Router.map ->
  # home page intro screen for reaction-shop
  @route 'shop/settings/general/paypal',
    controller: ShopAdminController
    template: 'paypal'