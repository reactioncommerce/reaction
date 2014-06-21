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
        $node.fadeOut alert.options.fadeOut
        return
      ), alert.options.autoHide
    return

  return

Template.bootstrapAlerts.helpers
  alerts: (placement) ->
    unless placement? then placement=""
    Alerts.collection_.find({"options.placement": placement})