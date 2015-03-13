Meteor.startup ->
  # Need to make this more specific. Currently it triggers for any click on any page.
  $(document.body).click (e) ->
    $targets = $(e.target).closest('*[data-event-action]')
    $targets = $targets.parents('*[data-event-action]').add($targets)
    $targets.each (index, element) ->
      $element = $(element)
      analyticsEvent =
        eventType: 'event' #
        category: $element.data('event-category')
        action: $element.data('event-action')
        label: $element.data('event-label')
        value: $element.data('event-value')
      # ga('send', 'event', analyticsEvent.category, analyticsEvent.action, analyticsEvent.label, analyticsEvent.value)
      console.log(
        'send event: Category: ' +
        analyticsEvent.category +
        ', Action: ' +
        analyticsEvent.action +
        ', Label: ' +
        analyticsEvent.label +
        ', Value: ' +
        analyticsEvent.value
      )
      ReactionCore.Collections.AnalyticsEvents.insert analyticsEvent
    
