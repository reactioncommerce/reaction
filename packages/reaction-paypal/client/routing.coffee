Router.map ->
  # home page intro screen for reaction-commerce
  @route 'shop/settings/general/paypal',
    controller: ShopAdminController
    template: 'paypal'