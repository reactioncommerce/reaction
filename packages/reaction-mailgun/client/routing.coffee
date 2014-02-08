Router.map ->
  @route 'mailgun',
    controller: ShopAdminController
    path: 'dashboard/settings/mailgun',
    template: 'mailgun'
    waitOn: ->
      PackagesHandle
