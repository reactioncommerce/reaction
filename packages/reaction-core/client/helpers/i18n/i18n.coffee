###################################################################################
#  initialize i18next http://i18next.com/
#
#  usage - in template: {{i18n 'cartDrawer.empty'}}
#  usage - inline tag: <td data-i18n='cartSubTotals.items'>
#  usage - reference:  <thead data-i18n>cartSubTotals.head</thead>
#  usage - alerts Alerts.add "Message!", "danger", placement: "productDetail", i18n_key: "productDetail.outOfStock"
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
    resources =  ReactionCore.Collections.Translations.find({ $or: [{'i18n':'en'},{'i18n': sessionLanguage}] },{fields:{_id: 0},reactive:false}).fetch()
    # map multiple translations into i18next format
    resources = resources.reduce (x, y) ->
        x[y.i18n]= y.translation
        x
    , {}

    $.i18n.init {
      lng: sessionLanguage
      fallbackLng: 'en'
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
# pass this the translation key as the first argument.
# optionally you can pass a string like "Invalid email", and we'll look for "invalidEmail"
# in the translations data.
#
# ex: {{i18n "accountsUI.error" "Invalid Email"}}
###

Handlebars.registerHelper "i18n", (i18n_key, camelCaseString) ->
  unless i18n_key then Meteor.throw("i18n key string required to translate")
  if (typeof camelCaseString) is "string" then i18n_key = i18n_key + "." + toCamelCase(camelCaseString)
  result = new Handlebars.SafeString(i18n.t(i18n_key))
  return result

#default return $ symbol
UI.registerHelper "currency", () ->
  shops = Shops.findOne()
  if shops then return shops.currency

UI.registerHelper "currencySymbol", () ->
  shops = Shops.findOne()
  if shops then return shops.moneyFormat