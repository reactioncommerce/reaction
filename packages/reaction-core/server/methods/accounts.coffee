###
# onCreateUser
# a special meteor hook to default user info on create
# see: http://docs.meteor.com/#/full/accounts_oncreateuser
# see: hooks.coffee for additional collection hooks
###
Accounts.onCreateUser (options, user) ->
  unless user.emails then user.emails = []
  # add default role for all users
  # Roles.addUsersToRoles user, 'guest', ReactionCore.getShopId()
  # see: https://github.com/alanning/meteor-roles/issues/79
  unless user.roles
    shopId = ReactionCore.getShopId()
    shop = ReactionCore.getCurrentShop()
    user.roles = {}
    user.roles[shopId] = shop?.defaultRoles || [ "guest", "account/profile" ]

  # TODO: only use accounts for managing profiles
  for service, profile of user.services
    if !user.username and profile.name then user.username = profile.name
    if profile.email then user.emails.push {'address': profile.email}

  # clone into and create our user's account
  account = _.clone(user)
  account.userId = user._id
  accountId = ReactionCore.Collections.Accounts.insert(account)
  ReactionCore.Events.info "Created account: " + accountId + " for user: " + user._id

  # return user to meteor accounts
  return user

###
# Account Methods
###
Meteor.methods
  ###
  # add new addresses to an account
  ###
  addressBookAdd: (doc, accountId) ->
    @unblock()
    check doc, ReactionCore.Schemas.Address
    check accountId, String
    ReactionCore.Schemas.Address.clean(doc)

    if doc.isShippingDefault or doc.isBillingDefault
      # set shipping default & clear existing
      if doc.isShippingDefault
        ReactionCore.Collections.Accounts.update
          "_id": accountId
          "userId": accountId
          "profile.addressBook.isShippingDefault": true
        ,
          $set:
            "profile.addressBook.$.isShippingDefault": false

      # set billing default & clear existing
      if doc.isBillingDefault
        ReactionCore.Collections.Accounts.update
          '_id': accountId
          "userId": accountId
          "profile.addressBook.isBillingDefault": true
        ,
          $set:
            "profile.addressBook.$.isBillingDefault": false
    # add address book entry
    ReactionCore.Collections.Accounts.upsert accountId, {
      $set: {"userId": accountId}
      $addToSet: {"profile.addressBook": doc}
    }
    return doc

  ###
  # update existing address in user's profile
  ###
  addressBookUpdate: (doc, accountId) ->
    @unblock()
    check doc, ReactionCore.Schemas.Address
    check accountId, String

    # reset existing address defaults
    if doc.isShippingDefault or doc.isBillingDefault
      if doc.isShippingDefault
        ReactionCore.Collections.Accounts.update
          "_id": accountId
          "profile.addressBook.isShippingDefault": true
        ,
          $set:
            "profile.addressBook.$.isShippingDefault": false
      if doc.isBillingDefault
        ReactionCore.Collections.Accounts.update
          "_id": accountId
          "profile.addressBook.isBillingDefault": true
        ,
          $set:
            "profile.addressBook.$.isBillingDefault": false

    # update existing address
    ReactionCore.Collections.Accounts.update
      "_id": accountId
      "profile.addressBook._id": doc._id
    ,
      $set:
        "profile.addressBook.$": doc
    return doc

  ###
  # remove existing address in user's profile
  ###
  addressBookRemove: (doc, accountId) ->
    @unblock()
    check doc, ReactionCore.Schemas.Address
    check accountId, String

    # remove
    ReactionCore.Collections.Accounts.update
      "_id": accountId
      "profile.addressBook._id": doc._id
    ,
      $pull: "profile.addressBook": { "_id": doc._id }

    return doc

  ###
  # invite new admin users
  # (not consumers) to secure access in the dashboard
  # to permissions as specified in packages/roles
  ###
  inviteShopMember: (shopId, email, name) ->
    check shopId, String
    check email, String
    check name, String
    @unblock()
    # get the shop first
    shop = Shops.findOne shopId
    # check permissions
    unless ReactionCore.hasOwnerAccess(shop)
      throw new Meteor.Error 403, "Access denied"

    # all params are required
    if shop and email and name
      currentUserName = Meteor.user()?.profile?.name || Meteor.user()?.username || "Admin"
      user = Meteor.users.findOne {"emails.address": email}
      unless user # user does not exist, invite user
        userId = Accounts.createUser
          email: email
          username: name
        user = Meteor.users.findOne(userId)
        unless user
          throw new Error("Can't find user")
        token = Random.id()
        Meteor.users.update userId,
          $set:
            "services.password.reset":
              token: token
              email: email
              when: new Date()
        # compile mail template
        SSR.compileTemplate('shopMemberInvite', Assets.getText('server/emailTemplates/shopMemberInvite.html'))
        try
          Email.send
            to: email
            from: currentUserName + " <" + shop.emails[0] + ">"
            subject: "You have been invited to join " + shop.name
            html: SSR.render 'shopMemberInvite',
              homepage: Meteor.absoluteUrl()
              shop: shop
              currentUserName: currentUserName
              invitedUserName: name
              url: Accounts.urls.enrollAccount(token)
        catch
          throw new Meteor.Error 403, "Unable to send invitation email."
      # existing user, send notification
      else
        # compile mail template
        SSR.compileTemplate('shopMemberInvite', Assets.getText('server/emailTemplates/shopMemberInvite.html'))
        try
          Email.send
            to: email
            from: currentUserName + " <" + shop.emails[0] + ">"
            subject: "You have been invited to join the " + shop.name
            html: SSR.render 'shopMemberInvite',
              homepage: Meteor.absoluteUrl()
              shop: shop
              currentUserName: currentUserName
              invitedUserName: name
              url: Meteor.absoluteUrl()
        catch
          throw new Meteor.Error 403, "Unable to send invitation email."
    else
      throw new Meteor.Error 403, "Access denied"
    return true


  ###
  # send an email to consumers on sign up
  ###
  sendWelcomeEmail: (shopId, userId) ->
    check shop, Object
    @unblock()

    email = Meteor.user(userId).emails[0].address
    SSR.compileTemplate('welcomeNotification', Assets.getText('server/emailTemplates/welcomeNotification.html'))
    Email.send
      to: email
      from: shop.emails[0]
      subject: "Welcome to " + shop.name + "!"
      html: SSR.render 'welcomeNotification',
        homepage: Meteor.absoluteUrl()
        shop: shop
        user: Meteor.user()
    return true

  ###
  # @summary addUserPermissions
  # @param {Array|String} permission
  #               Name of role/permission.  If array, users
  #               returned will have at least one of the roles
  #               specified but need not have _all_ roles.
  # @param {String} [group] Optional name of group to restrict roles to.
  #                         User's Roles.GLOBAL_GROUP will also be checked.
  # @returns {Boolean} success/failure
  ###
  addUserPermissions: (userId, permissions, group) ->
    check userId, Match.OneOf(String, Array)
    check permissions, Match.OneOf(String, Array)
    check group, Match.Optional(String)
    @unblock()

    # for roles
    try
      Roles.addUsersToRoles(userId, permissions, group)
    catch e
      ReactionCore.Events.info e

  ###
  # removeUserPermissions
  ###
  removeUserPermissions: (userId, permissions, group) ->
    check userId, String
    check permissions, Match.OneOf(String, Array)
    check group, Match.Optional(String, null)
    @unblock()

    # for shop member data
    try
      Roles.removeUsersFromRoles(userId, permissions, group)
    catch e
      ReactionCore.Events.info e

  ###
  # setUserPermissions
  ###
  setUserPermissions: (userId, permissions, group) ->
    check userId, String
    check permissions, Match.OneOf(String, Array)
    check group, Match.Optional(String)
    @unblock()

    # for shop member data
    try
      Roles.setUserRoles(userId, permissions, group)
    catch e
      ReactionCore.Events.info e
