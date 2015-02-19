Template.i18nChooser.helpers
  languages: ->
    languages = []
    shop = ReactionCore.Collections.Shops.findOne()
    if shop?.languages
      for language in shop.languages
        if language.enabled is true
          language.translation = "languages." + language.label.toLowercase
          languages.push language
      return languages

  active: () ->
    if Session.equals "language", @.i18n
      return "active"

Template.i18nChooser.events
  'click .i18n-language': (event,template)->
    event.preventDefault()
    Session.set('language',@.i18n)
