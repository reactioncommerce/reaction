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
#
getLabelsFor = (schema, name, sessionLanguage) ->
  labels = {}
  for fieldName in schema._schemaKeys
    i18n_key = name.toCamelCase() + "." + fieldName.split(".$").join("")
    #console.log "schema:  " + name + "  fieldName:  " + fieldName + " i18nkey: " + i18n_key
    translation = i18n.t(i18n_key)
    if new RegExp('string').test(translation) isnt true and translation isnt i18n_key
      #schema._schema[fieldName].label =  i18n.t(i18n_key)
      labels[fieldName] = translation

  unless Object.keys(labels).length is 0
    # console.log labels
    return labels
  else
    return null


getMessagesFor = (schema, name, sessionLanguage) ->
  messages = {}
  for message of SimpleSchema._globalMessages
    i18n_key = "globalMessages" + "." + message
    translation = i18n.t(i18n_key)

    if new RegExp('string').test(translation) isnt true and translation isnt i18n_key
      messages[message] = translation

  unless Object.keys(messages).length is 0
    # console.log labels
    return messages
  else
    return null


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
        # initialize autoform,schemas
        for schema, ss of ReactionCore.Schemas
          ss.labels getLabelsFor(ss, schema, sessionLanguage)
          ss.messages getMessagesFor(ss, schema, sessionLanguage)

        #initiliaze templates
        _.each Template, (template, name) ->
        # for template,name of Template
          originalRender = template.rendered
          template.rendered = ->
            unless name is "prototype"
              $("[data-i18n]").i18n()
              originalRender and originalRender.apply(this, arguments)
        #re-init i18n
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


# common helper method
UI.registerHelper "i18n", (i18n_key, camelCaseString) ->
  unless i18n_key then Meteor.throw("i18n key string required to translate")
  if (typeof camelCaseString) is "string" then i18n_key = i18n_key + "." + camelCaseString.toCamelCase()
  result = new Handlebars.SafeString(i18n.t(i18n_key))
  return result


#default return $ symbol
UI.registerHelper "currency", () ->
  shops = Shops.findOne()
  if shops then return shops.currency

# return shop specific currency format
UI.registerHelper "currencySymbol", () ->
  shops = Shops.findOne()
  if shops then return shops.moneyFormat