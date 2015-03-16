###
# add social image to user profile upon registration
###
Accounts.onCreateUser (options, user) ->

  if options.profile and options.profile.addressBook and options.profile.addressBook.length > 0
    hasShippingDefaultSet = false
    hasBillingDefaultSet = false
    _.each options.profile.addressBook, (address) ->
      if address.isBillingDefault
        hasBillingDefaultSet = true
      if address.isShippingDefault
        hasShippingDefaultSet = true
      if !address._id
        address._id = Random.id()
      return
    if !hasShippingDefaultSet
      options.profile.addressBook[0].isShippingDefault = true
    if !hasBillingDefaultSet
      options.profile.addressBook[0].isBillingDefault = true

  user.profile = options.profile || {}
  if options.emails
    if user.emails
      user.emails = options.emails.concat user.emails
    else user.emails = options.emails
  user.profile = options.profile || {}
  if user.services.facebook
    options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=small"
  user

###
# setting defaults of mail from shop configuration
# TODO: refactor for multiple email providers
###
setMailUrlForShop = (shop) ->
  coreMail = ReactionCore.Collections.Packages.findOne(name: "core").settings.mail
  mailUrl = "smtp://" + coreMail.user + ":" + coreMail.password + "@" + coreMail.host + ":" + coreMail.port + "/"
  process.env.MAIL_URL = process.env.MAIL_URL || mailUrl

Meteor.methods
  ###
  # this method is to invite new admin users
  # (not consumers) to secure access in the dashboard
  # to permissions as specified in packages/roles
  ###
  inviteShopMember: (shopId, email, name) ->
    check shopId, String
    check email, String
    check name, String

    shop = Shops.findOne shopId
    if shop and email and name
      if ReactionCore.hasOwnerAccess(shop)
        currentUserName = Meteor.user().profile.name || Meteor.user().username || "Admin"
        user = Meteor.users.findOne {"emails.address": email}
        unless user # user does not exist, invite user
          userId = Accounts.createUser
            email: email
            profile:
              name: name
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

        Shops.update shopId, {$addToSet: {members: {userId: user._id, isAdmin: true}}}

  ###
  # this method sends an email to consumers on sign up
  ###
  sendWelcomeEmail: (shop) ->
    check shop, Object

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
