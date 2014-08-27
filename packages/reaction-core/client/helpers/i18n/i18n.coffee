####################################################################################
#  initialize i18next http://i18next.com/
#
#  usage - in template: {{i18n 'cartDrawer.empty'}}
#  usage - inline tag: data-i18n='cartDrawer.empty'
#
#  see - reaction-core/i18n/en-dev.json for example definition/translation
#
#  all translations should go in en-dev.json, and will cascade to other language files
#
####################################################################################
Meteor.startup ->
    i18n.init {
      # useLocalStorage: true | false,
      # localStorageExpirationTime: 86400000 // in ms, default 1 week
      lng: i18n.detectLanguage(),
      ns: "core",
      resGetPath: "/packages/reaction-core/i18n/__ns__-__lng__.json",
      # debug: true
      },(t)->
        $("[data-i18n]").i18n()
