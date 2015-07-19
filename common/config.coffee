####
# reaction or meteor configurations
# This is a shared file, wrap use Meteor.isServer
# or Meteor.isClient to use specific server/client
####


#
# Configuration for Meteor Accounts
# See: http://docs.meteor.com/#/full/accounts_api

# Accounts.ui.config
#   requestPermissions:
#     facebook: [ 'public_profile', 'email','user_friends']
#     github: [ 'user']
#   requestOfflineToken: google: true
#   passwordSignupFields: 'EMAIL_ONLY'

# Accounts.config({oauthSecretKey: ...}

#
# Configuration for utilities:avatar
# See: https://atmospherejs.com/utilities/avatar
#

Avatar.setOptions
  defaultImageUrl: "https://raw.githubusercontent.com/reactioncommerce/reaction/development/public/resources/avatar.gif",
  fallbackType: "image" #or initials
  cssClassPrefix: "reactionAvatar" #custom
