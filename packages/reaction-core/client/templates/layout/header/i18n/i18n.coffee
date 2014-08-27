Template.i18nChooser.helpers
  active: (lng) ->
    if Session.equals "language",lng
      return "active"

Template.i18nChooser.events
  'click #i18n-en': (e)->
    e.preventDefault()
    Session.set('language','en')

  'click #i18n-es': (e) ->
    e.preventDefault()
    Session.set('language','es')