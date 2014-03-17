Router.map ->
  @route 'dashboard/settings/filepicker',
    controller: ShopAdminController
    path: 'dashboard/settings/filepicker',
    template: 'filepicker'
    waitOn: ->
      PackagesHandle