Accounts.onCreateUser (options, user) ->
  # create or clone profile,email to Accounts
  userAccount  = ReactionCore.Collections.Accounts.findOne('userId': user._id)
  unless userAccount
    account = _.clone(user)
    account.userId = user._id
    accountId = ReactionCore.Collections.Accounts.insert(account)
    ReactionCore.Events.info "Created account: " + accountId + " for user: " + user._id
    # add default role for all users
    Roles.addUsersToRoles user._id, "guest", Roles.GLOBAL_GROUP

  # return to meteor accounts
  return user

@setMailUrlForShop = (shop) ->
  coreMail = ReactionCore.Collections.Packages.findOne(name: "core").settings.mail
  if coreMail.user and coreMail.password
    mailUrl = "smtp://" + coreMail.user + ":" + coreMail.password + "@" + coreMail.host + ":" + coreMail.port + "/"
    process.env.MAIL_URL = process.env.MAIL_URL || mailUrl
  else
    ReactionCore.Events.warn 'Core Mail Settings not set. Unable to send email.'
    throw new Meteor.Error( 403, '<a href="/dashboard/settings/shop#mail">Core Mail Settings</a> not set. Unable to send email.')
    return

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
          "profile.addressBook.isShippingDefault": true
        ,
          $set:
            "profile.addressBook.$.isShippingDefault": false

      # set billing default & clear existing
      if doc.isBillingDefault
        ReactionCore.Collections.Accounts.update
          '_id': accountId
          "profile.addressBook.isBillingDefault": true
        ,
          $set:
            "profile.addressBook.$.isBillingDefault": false

    # add address book entry
    ReactionCore.Collections.Accounts.upsert accountId, {$addToSet: {"profile.addressBook": doc}}
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
  # invite new admin users
  # (not consumers) to secure access in the dashboard
  # to permissions as specified in packages/roles
  ###
  inviteShopMember: (shopId, email, name) ->
    check shopId, String
    check email, String
    check name, String
    @unblock()

    shop = Shops.findOne shopId
    if shop and email and name
      if ReactionCore.hasOwnerAccess(shop)
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

          setMailUrlForShop(shop)
          SSR.compileTemplate('shopMemberInvite', Assets.getText('server/emailTemplates/shopMemberInvite.html'))
          Email.send
            to: email
            from: currentUserName + " <" + shop.email + ">"
            subject: "You have been invited to join " + shop.name
            html: SSR.render 'shopMemberInvite',
              homepage: Meteor.absoluteUrl()
              shop: shop
              currentUserName: currentUserName
              invitedUserName: name
              url: Accounts.urls.enrollAccount(token)
        else # user exist, send notification
          setMailUrlForShop(shop)
          SSR.compileTemplate('shopMemberInvite', Assets.getText('server/emailTemplates/shopMemberInvite.html'))
          Email.send
            to: email
            from: currentUserName + " <" + shop.email + ">"
            subject: "You have been invited to join the " + shop.name
            html: SSR.render 'shopMemberInvite',
              homepage: Meteor.absoluteUrl()
              shop: shop
              currentUserName: currentUserName
              invitedUserName: name
              url: Meteor.absoluteUrl()

  ###
  # send an email to consumers on sign up
  ###
  sendWelcomeEmail: (shop) ->
    check shop, Object
    @unblock()

    email = Meteor.user().emails[0].address
    setMailUrlForShop(shop)
    SSR.compileTemplate('welcomeNotification', Assets.getText('server/emailTemplates/welcomeNotification.html'))
    Email.send
      to: email
      from: shop.email
      subject: "Welcome to " + shop.name + "!"
      html: SSR.render 'welcomeNotification',
        homepage: Meteor.absoluteUrl()
        shop: shop
        user: Meteor.user()

  ###
  # @method addUserPermissions
  # @param {Array|String} permission
  #               Name of role/permission.  If array, users
  #               returned will have at least one of the roles
  #               specified but need not have _all_ roles.
  # @param {String} [group] Optional name of group to restrict roles to.
  #                         User's Roles.GLOBAL_GROUP will also be checked.
  # @return {Boolean} success/failure
  ###
  addUserPermissions: (userId, permissions, group) ->
    console.log userId, permissions, group
    check userId, Match.OneOf(String, Array)
    check permissions, Match.OneOf(String, Array)
    check group, Match.Optional(String)
    # for roles
    try
      Roles.addUsersToRoles(userId, permissions, group)
    catch e
      console.log e

  removeUserPermissions: (userId, permissions, group) ->
    check userId, String
    check permissions, Match.OneOf(String, Array)
    check group, Match.Optional(String)

    # for shop member data
    try
      Roles.removeUsersFromRoles(userId, permissions, group)
    catch e
      console.log e

  setUserPermissions: (userId, permissions, group) ->
    check userId, String
    check permissions, Match.OneOf(String, Array)
    check group, Match.Optional(String)

    # for shop member data
    try
      Roles.removeUsersFromRoles(userId, permissions, group)
    catch e
      console.log e
