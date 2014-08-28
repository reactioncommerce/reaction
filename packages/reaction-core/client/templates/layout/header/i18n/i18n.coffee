Template.i18nChooser.helpers
  active: (lng) ->
    if Session.equals "language",lng
      return "active"

Template.i18nChooser.events
  'click #i18n-en': (e)->
    e.preventDefault()
    Session.set('language','en')
    $("[data-i18n]").i18n()

  'click #i18n-es': (e) ->
    e.preventDefault()
    Session.set('language','es')
    $("[data-i18n]").i18n()