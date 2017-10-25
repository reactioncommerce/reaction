/* global sAlert */
import _ from "lodash";
import swal from "sweetalert2";
import { Meteor } from "meteor/meteor";
import "sweetalert2/dist/sweetalert2.css";
import Alerts from "./inlineAlerts";

/**
 * @file ReactionAlerts - Shows a popup alert, extends Bootstrap Alerts and adds more alert types. See Bootstrap Alert documentation: https://getbootstrap.com/docs/3.3/components/#alerts
 *
 *
 * @module ReactionAlerts
 */

Meteor.startup(function () {
  sAlert.config({
    effect: "stackslide",
    position: "bottom-left",
    timeout: 5000,
    html: false,
    onRouteClose: true,
    stack: true,
    // or you can pass an object:
    // stack: {
    //     spacing: 10 // in px
    //     limit: 3 // when fourth alert appears all previous ones are cleared
    // }
    offset: 0, // in px - will be added to first alert (bottom or top - depends of the position in config)
    beep: false
    // examples:
    // beep: '/beep.mp3'  // or you can pass an object:
    // beep: {
    //     info: '/beep-info.mp3',
    //     error: '/beep-error.mp3',
    //     success: '/beep-success.mp3',
    //     warning: '/beep-warning.mp3'
    // }
    // onClose: _.noop //
    // examples:
    // onClose: function() {
    //     /* Code here will be executed once the alert closes. */
    // }
  });
});

Object.assign(Alerts, {

  inline(alertMessage, type, alertOptions) {
    // Convert error to danger, for inlineAlerts
    const mode = type === "error" ? "danger" : type;
    return this.add(alertMessage, mode, alertOptions);
  },

  /**
   * Show a popup alert
   * @example
   * // Simple
   * Alerts.alert("title", "message", {}, callbackFunction);
   * // - OR, for more control -
   * Alerts.alert({
   * 	title: "Title",
   * 	text: "Message Text",
   * 	type: "success|info|warning|error|"
   * }, callbackFunction);
   *
   * @param  {string|object} titleOrOptions Pass a string or an object containing options
   * @param  {string}   messageOrCallback [description]
   * @param  {string}   options           [description]
   * @param  {function} callback          [description]
   * @return {string}                     [description]
   */
  alert(titleOrOptions, messageOrCallback, options, callback) {
    if (_.isObject(titleOrOptions)) {
      return swal({
        type: "info",
        ...titleOrOptions
      }).then((isConfirm) => {
        if (isConfirm === true && typeof messageOrCallback === "function") {
          messageOrCallback(isConfirm, false);
        }
      }, dismiss => {
        if (dismiss === "cancel" || dismiss === "esc" || dismiss === "overlay") {
          messageOrCallback(false, dismiss);
        }
      }).catch(function (err) {
        if (err === "cancel" || err === "overlay" || err === "timer") {
          return undefined; // Silence error
        }
        throw err;
      });
    }

    const title = titleOrOptions;
    const message = messageOrCallback;

    return swal({
      title,
      text: message,
      type: "info",
      ...options
    }).then((isConfirm) => {
      if (isConfirm === true && typeof callback === "function") {
        callback(isConfirm);
      }
    }).catch(function (err) {
      if (err === "cancel" || err === "overlay" || err === "timer") {
        return undefined; // Silence error
      }
      throw err;
    });
  },

  toast(message, type, options) {
    switch (type) {
      case "error":
      case "warning":
      case "success":
      case "info":
        return sAlert[type](message, options);
      default:
        return sAlert.success(message, options);
    }
  }
});
