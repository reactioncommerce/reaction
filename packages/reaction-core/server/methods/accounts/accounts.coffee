###
# add social image to user profile upon registration
###
Accounts.onCreateUser (options, user) ->
  user.profile = options.profile || {}
  if user.services.facebook
    options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=small"
  user

###
# setting defaults of mail from shop configuration
###
setMailUrlForShop = (shop) ->
  mailgun = ReactionCore.Collections.Packages.findOne({shopId:shop._id, name:'reaction-mailgun'})
  sCES = null
  if mailgun and mailgun.settings
    sCES = mailgun.settings
  else
    if shop.useCustomEmailSettings
      sCES = shop.customEmailSettings

  if sCES
      process.env.MAIL_URL = "smtp://" + sCES.username + ":" + sCES.password + "@" + sCES.host + ":" + sCES.port + "/"

Meteor.methods
  ###
  # this method is to invite new admin users
  # (not consumers) to secure access in the dashboard
  # to permissions as specified in packages/roles
  ###
  inviteShopMember: (shopId, email, name) ->
    shop = Shops.findOne shopId
    if shop and email and name
      if ReactionCore.hasOwnerAccess(shop)
        currentUserName = Meteor.user().profile.name
        user = Meteor.users.findOne {"emails.address": email}
        unless user # user does not exist, invite him
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
          Email.send
            to: email
            from: currentUserName + " <" + shop.email + ">"
            subject: "[Reaction] You have been invited to join the " + shop.name + " staff"
            html: Spacebars.templates['shopMemberInvite']
              homepage: Meteor.absoluteUrl()
              shop: shop
              currentUserName: currentUserName
              invitedUserName: name
              url: Accounts.urls.enrollAccount(token)
        else # user exist, send notification
          setMailUrlForShop(shop)
          Email.send
            to: email
            from: currentUserName + " <" + shop.email + ">"
            subject: "[Reaction] You have been invited to join the " + shop.name + " staff"
            html: Spacebars.templates['shopMemberNotification']
              homepage: Meteor.absoluteUrl()
              shop: shop
              currentUserName: currentUserName
              invitedUserName: name

        Shops.update shopId, {$addToSet: {members: {userId: user._id, isAdmin: true}}}

  ###
  # this method sends an email to consumers on sign up
  ###
  sendWelcomeEmail: (shop) ->
    email = Meteor.user().emails[0].address
    setMailUrlForShop(shop)
    Email.send
      to: email
      from: shop.email
      subject: "Welcome to " + shop.name + "!"
      html: Spacebars.templates['memberWelcomeNotification']
        homepage: Meteor.absoluteUrl()
        shop: shop
