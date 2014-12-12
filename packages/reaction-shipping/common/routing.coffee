Router.map ->
  @route 'shipping',
    controller: ShopAdminController
    path: 'dashboard/settings/shipping',
    template: 'shipping'
    waitOn: ->
      return Meteor.subscribe "shipping"
    # data: ->
    #   return ReactionCore.Collections.Shipping.find()