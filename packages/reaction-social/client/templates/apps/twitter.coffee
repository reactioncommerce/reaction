Template.twitter.onRendered ->
  if @data.placement == 'footer' and @data.apps.twitter?.profilePage?
    @.$('.twitter-share').attr('href', @data.apps.twitter.profilePage)
  else
    @autorun ->
      template = Template.instance()
      data = Template.currentData()
      $('meta[property^="twitter:"]').remove()
      #
      # Twitter cards
      #
      $('<meta>', { property: 'twitter:card', content: 'summary' }).appendTo 'head'
      if data.apps.twitter.username
        $('<meta>', { property: 'twitter:creator', content: data.apps.twitter.username }).appendTo 'head'
      description = data.apps.twitter?.description || $('.product-detail-field.description').text()
      $('<meta>', { property: 'twitter:url', content: location.origin + location.pathname }).appendTo 'head'
      $('<meta>', { property: 'twitter:title', content: "#{data.title}" }).appendTo 'head'
      $('<meta>', { property: 'twitter:description', content: description }).appendTo 'head'
      if data.media
        if not /^http(s?):\/\/+/.test(data.media)
          media = location.origin + data.media
          $('<meta>', { property: 'twitter:image', content: data.media }).appendTo 'head'
      #
      # Twitter share button
      #
      preferred_url = data.url || location.origin + location.pathname
      url = encodeURIComponent preferred_url
      base = "https://twitter.com/intent/tweet"
      text = encodeURIComponent data.apps.twitter?.title || data.title
      href = base + "?url=" + url + "&text=" + text
      if data.apps.twitter.username
        href += "&via=" + data.apps.twitter.username
      template.$(".twitter-share").attr "href", href

Template.twitter.events
  'click a': (event, template) ->
    event.preventDefault()
    window.open Template.instance().$('.twitter-share').attr('href'), 'twitter_window', 'width=750, height=650'

Template.twitter.helpers
  enabled: ->
    apps = Template.currentData().apps
    return 'twitter' of apps and apps.twitter.enabled
