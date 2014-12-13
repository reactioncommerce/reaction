Template.i18nChooser.helpers
  languages: ->
    return ReactionCore.Collections.Translations.find({},{fields:{'language':1, 'i18n': 1, 'entryText': 1}})

  active: () ->
    if Session.equals "language", @.i18n
      return "active"

Template.i18nChooser.events
  'click .i18n-language': (event,template)->
    event.preventDefault()
    Session.set('language',@.i18n)
    $("[data-i18n]").i18n()
