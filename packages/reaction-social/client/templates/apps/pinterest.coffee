Template.pinterest.onRendered ->
  if @data.placement == 'footer' and @data.apps.pinterest?.profilePage?
    @.$('.pinterest-share').attr('href', @data.apps.pinterest.profilePage)
  else
    ###
      Pinterest requires three parameters:
        url: desired url
        media: image being shared
        description: image description
    ###
    @autorun ->
      # console.log 'running'
      template = Template.instance()
      data = Template.currentData()
      preferred_url = data.url || location.origin + location.pathname
      url = encodeURIComponent preferred_url
      if data.media
        if not /^http(s?):\/\/+/.test(data.media)
          media = location.origin + data.media
      description = encodeURIComponent data.apps.pinterest?.description || $('.product-detail-field.description').text()
      href = "http://www.pinterest.com/pin/create/button/?url=#{url}&media=#{media}&description=#{description}"
      template.$('.pinterest-share').attr 'href', href

Template.pinterest.events
  'click a': (event, template) ->
    event.preventDefault()
    window.open Template.instance().$('.pinterest-share').attr('href'), 'pinterest_window', 'width=750, height=650'

Template.pinterest.helpers
  enabled: ->
    apps = Template.currentData().apps
    return 'pinterest' of apps and apps.pinterest.enabled
