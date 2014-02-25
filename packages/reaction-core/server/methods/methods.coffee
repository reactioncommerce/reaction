# Future = Npm.require('fibers/future')

#
# setting defaults of mail from shop configuration
#
setMailUrlForShop = (shop) ->
  mailgun = Packages.findOne({shopId:shop._id, name:'reaction-mailgun'})
  sCES = null
  if mailgun and mailgun.settings
    sCES = mailgun.settings
  else
    if shop.useCustomEmailSettings
      sCES = shop.customEmailSettings

  if sCES
      process.env.MAIL_URL = "smtp://" + sCES.username + ":" + sCES.password + "@" + sCES.host + ":" + sCES.port + "/"

Meteor.methods

  #
  # this method is to invite new admin users
  # (not consumers) to secure access in the dashboard
  # to permissions as specified in packages/roles
  #
  inviteShopMember: (shopId, email, name) ->
    shop = Shops.findOne shopId
    if shop and email and name
      if Meteor.app.hasOwnerAccess(shop)
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
            html: Handlebars.templates['shopMemberInvite']
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
            html: Handlebars.templates['shopMemberNotification']
              homepage: Meteor.absoluteUrl()
              shop: shop
              currentUserName: currentUserName
              invitedUserName: name

        Shops.update shopId, {$addToSet: {members: {userId: user._id, isAdmin: true}}}

  #
  # this method sends an email to consumers on sign up
  #
  sendWelcomeEmail: (shop) ->
    email = Meteor.user().emails[0].address
    setMailUrlForShop(shop)
    Email.send
      to: email
      from: shop.email
      subject: "[Reaction] Welcome to " + shop.name + "!"
      html: Handlebars.templates['memberWelcomeNotification']
        homepage: Meteor.absoluteUrl()
        shop: shop




  ###
  # method to determine user's location for autopopulating addresses
  ###
  locateAddress: (latitude, longitude) ->
    Future = Npm.require("fibers/future")
    geocoder = Npm.require("node-geocoder")
    future = new Future()
    if latitude
      locateCoord = geocoder.getGeocoder("google", "http")
      locateCoord.reverse latitude, longitude, (err, address) ->
        if err then Meteor._debug(err)
        future.return(address)
    else
      ip = headers.methodClientIP(@)
      locateIP = geocoder.getGeocoder("freegeoip", "http")
      #ip = "76.168.14.229"
      locateIP.geocode ip, (err, address) ->
        if err then Meteor._debug(err)
        future.return(address)

    address = future.wait()
    if address?.length
      address[0]
    else # default location if nothing found is US
      {
        latitude: null
        longitude: null
        country: "United States"
        city: null
        state: null
        stateCode: null
        zipcode: null
        streetName: null
        streetNumber: null
        countryCode: "US"
      }
