Template.bootstrapAlert.onCreated = ->
  this.isFirstRender = true

Template.bootstrapAlert.onRendered = ->
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
  alerts: (placement, id) ->
    placement = "" unless placement
    id = "" unless id
    return Alerts.collection_.find({'options.placement': placement, 'options.id': id})

Template.bootstrapAlert.events
  'click button.close': (event, template) ->
    # When we close, delete the alert
    Alerts.collection_.remove this._id
