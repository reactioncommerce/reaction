#
# Configuration for Meteor Accounts
# See: http://docs.meteor.com/#/full/accounts_api
#

# Accounts.ui.config
#   requestPermissions:
#     facebook: [ 'public_profile', 'email','user_friends']
#     github: [ 'user']
#   requestOfflineToken: google: true
#   passwordSignupFields: 'EMAIL_ONLY'

# Accounts.config({oauthSecretKey: ...}

#
# Configuration for bengott:avatar
# See: https://github.com/bengott/meteor-avatar
#

Avatar.options = {
  defaultImageUrl: "https://raw.githubusercontent.com/reactioncommerce/reaction/development/public/resources/avatar.gif",
  fallbackType: "default image"
}
