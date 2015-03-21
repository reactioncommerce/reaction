Template.facebook.onRendered ->
  if @data.placement == 'footer' and @data.apps.facebook?.profilePage?
    @.$('.facebook-share').attr('href', @data.apps.facebook.profilePage)
  else
    @autorun ->
      template = Template.instance()
      data = Template.currentData()

      $('meta[property^="og:"]').remove()
      #
      # OpenGraph tags
      #
      description = data.apps.facebook?.description || $('.product-detail-field.description').text()
      url = data.url || location.origin + location.pathname
      title = data.title || document.title
      $('<meta>', { property: 'og:type', content: 'article' }).appendTo 'head'
      $('<meta>', { property: 'og:site_name', content: location.hostname }).appendTo 'head'
      $('<meta>', { property: 'og:url', content: url }).appendTo 'head'
      $('<meta>', { property: 'og:title', content: title }).appendTo 'head'
      $('<meta>', { property: 'og:description', content: description }).appendTo 'head'

      if data.media
        if not /^http(s?):\/\/+/.test(data.media)
          media = location.origin + data.media
        $('<meta>', { property: 'og:image', content: media }).appendTo 'head'

      if data.apps.facebook.appId?
        template.$('.facebook-share').click (e) ->
          e.preventDefault()
          FB.ui {
            method: 'share'
            display: 'popup'
            href: url
          }, (response) ->
      else
        url = encodeURIComponent url
        base = "https://www.facebook.com/sharer/sharer.php"
        title = encodeURIComponent title
        summary = encodeURIComponent description
        href = base + "?s=100&p[url]=" + url + "&p[title]=" + title + "&p[summary]=" + summary
        if data.media
            href += "&p[images][0]=" + encodeURIComponent media

        template.$(".facebook-share").attr "href", href

    return

Template.facebook.onCreated ->
  # check if facebook app is enabled, and init the sdk if it's enabled
  apps = Template.currentData().apps
  isEnabled = 'facebook' of apps and apps.facebook.enabled
  if isEnabled
    # silence that annoying complaint
    $('<div id="fb-root"></div>').appendTo 'body'
    window.fbAsyncInit = ->
      FB.init({
        appId: apps.facebook.appId
        xfbml: true
        version: 'v2.1'
      })
    ((d, s, id) ->
      js = undefined
      fjs = d.getElementsByTagName(s)[0]
      if d.getElementById(id)
        return
      js = d.createElement(s)
      js.id = id
      js.src = '//connect.facebook.net/en_US/sdk.js'
      fjs.parentNode.insertBefore js, fjs
      return
    ) document, 'script', 'facebook-jssdk'
  return isEnabled
