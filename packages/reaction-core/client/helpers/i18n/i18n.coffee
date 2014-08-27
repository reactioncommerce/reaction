###################################################################################
#  initialize i18next http://i18next.com/
#
#  usage - in template: {{i18n 'cartDrawer.empty'}}
#  usage - inline tag: <td data-i18n='cartSubTotals.items'>
#  usage - reference:  <thead data-i18n>cartSubTotals.head</thead>
#
#  see - reaction-core/i18n/en-dev.json for example definition/translation
#
#  all translations should go in en-dev.json, and will cascade to other language files
#
###################################################################################

Meteor.startup ->
  Deps.autorun () ->
    sessionLanguage = Session.get "language"
    unless sessionLanguage
      Session.set "language", i18n.detectLanguage()
      console.log "setting"
    i18n.init {
      useDataAttrOptions: true
      # useLocalStorage: true,
      # localStorageExpirationTime: 3000, #86400000 // in ms, default 1 week
      lng: sessionLanguage
      ns: "core"
      resGetPath: "/packages/reaction-core/i18n/__ns__-__lng__.json"
      # debug: true
      },(t)->
        $("[data-i18n]").i18n()
    # else
    #   console.log "Else", sessionLanguage
    #   i18n.setLng(sessionLanguage)
    #   $("[data-i18n]").i18n()

###
# i18n translate
# see: http://i18next.com/
###
Handlebars.registerHelper "i18n", (i18n_key) ->

  result = i18n.t(i18n_key)
  return new Handlebars.SafeString(result)

#default return $ symbol
UI.registerHelper "currency", () ->
  shops = Shops.findOne()
  if shops then return shops.currency

UI.registerHelper "currencySymbol", () ->
  shops = Shops.findOne()
  if shops then return shops.moneyFormat