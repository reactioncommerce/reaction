/**
* bootstrapAlert helpers
*/

Template.bootstrapAlert.onCreated(function() {
  return this.isFirstRender = true;
});

Template.bootstrapAlert.onRendered(function() {
  var $node, alert;
  alert = this.data;
  $node = $(this.firstNode);
  Meteor.defer(function() {
    Alerts.collection_.update(alert._id, {
      $set: {
        seen: true
      }
    });
  });
  $node.removeClass("hide").hide().fadeIn(alert.options.fadeIn, function() {
    if (alert.options.autoHide) {
      Meteor.setTimeout((function() {
        $node.fadeOut(alert.options.fadeOut, function() {
          return Alerts.collection_.remove(alert._id);
        });
      }), alert.options.autoHide);
    }
  });
});

Template.bootstrapAlerts.helpers({
  alerts: function(placement, id) {
    if (!placement) {
      placement = "";
    }
    if (!id) {
      id = "";
    }
    return Alerts.collection_.find({
      'options.placement': placement,
      'options.id': id
    });
  }
});

Template.bootstrapAlert.events({
  'click button.close': function(event, template) {
    return Alerts.collection_.remove(this._id);
  }
});
