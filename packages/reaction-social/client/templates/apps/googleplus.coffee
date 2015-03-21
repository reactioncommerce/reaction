Template.googleplus.onRendered ->
  if @data.placement == 'footer' and @data.apps.googleplus?.profilePage?
    @.$('.googleplus-share').attr('href', @data.apps.googleplus.profilePage)
  else
    @autorun ->
      template = Template.instance()
      data = Template.currentData()
      $('meta[itemscope]').remove()
      #
      # Schema tags
      #
      description = data.apps.googleplus?.description || $('.product-detail-field.description').text()
      url = data.url || location.origin + location.pathname
      title = data.title
      itemtype = data.apps.googleplus?.itemtype || 'Article'
      $('html').attr('itemscope', '').attr('itemtype', "http://schema.org/#{itemtype}")
      $('<meta>', { itemprop: 'name', content: location.hostname }).appendTo 'head'
      $('<meta>', { itemprop: 'url', content: url }).appendTo 'head'
      $('<meta>', { itemprop: 'description', content: description }).appendTo 'head'
      if data.media
        if not /^http(s?):\/\/+/.test(data.media)
          media = location.origin + data.media
        $('<meta>', { itemprop: 'image', content: media }).appendTo 'head'
      #
      # Google share button
      #
      href = "https://plus.google.com/share?url=#{url}"
      template.$(".googleplus-share").attr "href", href

Template.googleplus.events
  'click a': (event, template) ->
    event.preventDefault()
    window.open Template.instance().$('.googleplus-share').attr('href'), 'googleplus_window', 'width=750, height=650'
