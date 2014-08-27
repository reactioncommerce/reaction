Template.i18nChooser.events
  'click #i18n-en': (e)->
    e.preventDefault()
    i18n.setLng 'en', ->
      $("[data-i18n]").i18n()

  'click #i18n-es': (e) ->
    e.preventDefault()
    i18n.setLng 'es', ->
      $("[data-i18n]").i18n()