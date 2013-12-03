Meteor.methods
  inviteShopMember: (shopId, email, name, role) ->
    shop = Shops.findOne shopId
    if shop and email and name and role
      userId = Accounts.createUser
        email: email
        profile:
          name: name
      Meteor.users.update userId, {$set: {shopRoles: [{shopId: shopId, name: role}]}}
      Accounts.sendEnrollmentEmail(userId)
