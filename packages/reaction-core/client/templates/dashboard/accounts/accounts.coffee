Template.coreAccounts.helpers
  members: () ->
    members = []
    if ReactionCore.hasOwnerAccess()
      ShopMembers = Meteor.subscribe 'ShopMembers'
      if ShopMembers.ready()
        shopUsers = Meteor.users.find()
        shopUsers.forEach (user) ->
          member = {}
          member.userId = user._id
          member.email = user.emails[0]?.address if user.email
          member.username = user?.username
          member.isAdmin = Roles.userIsInRole user._id, 'admin', ReactionCore.getShopId()
          member.roles = user.roles

          if Roles.userIsInRole member.userId, 'manager', ReactionCore.getShopId()
            member.role = "Manager"

          if Roles.userIsInRole member.userId, 'admin', ReactionCore.getShopId()
            member.role = "Administrator"

          if Roles.userIsInRole member.userId, 'owner', ReactionCore.getShopId()
            member.role = "Owner"

          else if Roles.userIsInRole member.userId, Roles.GLOBAL_GROUP , ReactionCore.getShopId()
            member.role = "Guest"

          members.push member
        return members

Template.coreAccounts.events
  "click .button-add-member": (event,template) ->
    $('.settings-account-list').hide()
    $('.member-form').removeClass('hidden')

