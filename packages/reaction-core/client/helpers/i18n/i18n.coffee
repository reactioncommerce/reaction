###################################################################################
#  initialize i18next http://i18next.com/
#
#  usage - in template: {{i18n 'cartDrawer.empty'}}
#  usage - inline tag: <td data-i18n='cartSubTotals.items'>
#  usage - reference:  <thead data-i18n>cartSubTotals.head</thead>
#
#  see - reaction-core/private/data/Translations.json for example definition/translation
#
#  all translations should go in private/data/Translations.json, where they get imported
#  to the Translations collection.
#
###################################################################################
Meteor.startup ->
  Session.set "language", i18n.detectLanguage()

Deps.autorun () ->
  sessionLanguage = Session.get "language"
  Meteor.subscribe "Translations", sessionLanguage, () ->
    resources =  ReactionCore.Collections.Translations.findOne({},{fields:{_id: 0},reactive:false})
    $.i18n.init {
      lng: sessionLanguage
      fallbackLang: 'en'
      ns: "core"
      resStore: resources
      # debug: true
      },(t)->
         #initiliaze
        _.each Template, (template, name) ->
          originalRender = template.rendered
          template.rendered = ->
            unless name is "prototype"
              $("[data-i18n]").i18n()
              originalRender and originalRender.apply(this, arguments)
        $("[data-i18n]").i18n()


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