Template.member.helpers
  name: ->
    this.profile.name
  email: ->
    this.emails[0].address
  role: ->
    shopRole = _.find this.shopRoles, (shopRole) ->
      shopRole.shopId is packageShop.shopId
    shopRole.name
