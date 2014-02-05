Router.map ->
  @route 'filepicker-io',
    controller: ShopAdminController
    path: 'dashboard/settings/filepicker',
    template: 'filepicker-io'
    waitOn: ->
      PackagesHandle