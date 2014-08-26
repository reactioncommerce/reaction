# *****************************************************
# global reaction client javascript
#
# *****************************************************
Meteor.startup ->
  ###
  #  Initialize translations
  ###
  userLang = navigator.language || navigator.userLanguage;
  console.log userLang

  i18nOptions =
    resGetPath: '/packages/reaction-core/i18n/core.es-US.json'
    getAsync: false
    lng: "en-US"

  i18n.init(i18nOptions)