import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";
import Alerts from "./inlineAlerts";

/**
 * inlineAlert helpers
 */

Template.inlineAlert.onCreated(function () {
  this.isFirstRender = true;
  return this.isFirstRender;
});

Template.inlineAlert.onRendered(function () {
  const alert = this.data;
  const $node = $(this.firstNode);

  Meteor.defer(() => {
    Alerts.collection_.update(alert._id, {
      $set: {
        seen: true
      }
    });
  });

  $node.removeClass("hide").hide().fadeIn(alert.options.fadeIn, () => {
    if (alert.options.autoHide) {
      Meteor.setTimeout(() => {
        $node.fadeOut(alert.options.fadeOut, () => Alerts.collection_.remove(alert._id));
      }, alert.options.autoHide);
    }
  });
});

Template.inlineAlerts.helpers({
  alerts(alertPlacement, alertId) {
    let id = alertId;
    let placement = alertPlacement;
    if (!placement) {
      placement = "";
    }
    if (!id) {
      id = "";
    }
    return Alerts.collection_.find({
      "options.placement": placement,
      "options.id": id
    });
  }
});

Template.inlineAlert.events({
  "click button.close"() {
    return Alerts.collection_.remove(this._id);
  }
});
