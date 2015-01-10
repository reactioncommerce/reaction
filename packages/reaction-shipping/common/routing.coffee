Router.map ->
  @route 'shipping',
    controller: ShopAdminController
    path: 'dashboard/settings/shipping',
    template: 'shipping'
    waitOn: ->
      return ReactionCore.Subscriptions.Packages
    subscriptions: ->
      return Meteor.subscribe "shipping"