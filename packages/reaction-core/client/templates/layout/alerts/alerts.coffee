Template.bootstrapAlert.rendered = ->
  alert = @data
  $node = $(@firstNode)
  Meteor.defer ->
    Alerts.collection_.update alert._id,
      $set:
        seen: true

    return

  $node.removeClass("hide").hide().fadeIn alert.options.fadeIn, ->
    if alert.options.autoHide
      Meteor.setTimeout (->
        $node.fadeOut alert.options.fadeOut, ->
          # After we auto-hide, delete the alert
          Alerts.collection_.remove alert._id
        return
      ), alert.options.autoHide
    return

  return

Template.bootstrapAlerts.helpers
  alerts: (placement) ->
    unless placement? then placement=""
    Alerts.collection_.find({"options.placement": placement})

Template.bootstrapAlert.events
  'click button.close': (event, template) ->
    # When we close, delete the alert
    Alerts.collection_.remove this._id