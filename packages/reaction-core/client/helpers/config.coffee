# *****************************************************
# global reaction client javascript
#
# *****************************************************
Meteor.startup ->
  ###
  #  Initialize translations
  ###

  i18nOptions =
    resGetPath: '/packages/reaction-core/i18n/core.en-US.json'
    getAsync: false
    lng: "en-US"

  i18n.init(i18nOptions)