import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";
import swal from "sweetalert2";
import { Meteor } from "meteor/meteor";
import "sweetalert2/dist/sweetalert2.css";
import Alerts from "./inlineAlerts";
import Alert from "react-s-alert";
import { getRootNode } from "/imports/plugins/core/router/client/browserRouter.js";

/**
 * @file ReactionAlerts - Shows a popup alert, extends Bootstrap Alerts and adds more alert types. See Bootstrap Alert documentation: https://getbootstrap.com/docs/3.3/components/#alerts
 *
 *
 * @module ReactionAlerts
 */

const getAlertWrapper = () => {
  const rootNode = getRootNode();

  rootNode.insertAdjacentHTML("beforebegin", "<div id='s-alert-wrapper'></div>");
  return document.getElementById("s-alert-wrapper");
};

const initAlertWrapper = () => {
  ReactDOM.render(
    (
      <Alert
        effect="stackslide"
        position="bottom-left"
        timeout={5000}
        html={false}
        onRouteClose={true}
        stack={true}
        offset={0} // in px - will be added to first alert (bottom or top - depends of the position in config)
        beep={false}
      />
    ), getAlertWrapper()
  );
};

Meteor.startup(() => {
  initAlertWrapper();
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
   *   title: "Title",
   *   text: "Message Text",
   *   type: "success|info|warning|error|"
   * }, callbackFunction);
   *
   * @param  {string|object} titleOrOptions Pass a string or an object containing options
   * @param  {string}   messageOrCallback [description]
   * @param  {string}   options           [description]
   * @param  {function} callback          [description]
   * @returns {string}                     [description]
   */
  alert(titleOrOptions, messageOrCallback, options, callback) {
    if (_.isObject(titleOrOptions)) {
      return swal({
        useRejections: true,
        type: "info",
        ...titleOrOptions
      }).then((isConfirm) => {
        if (isConfirm === true && typeof messageOrCallback === "function") {
          messageOrCallback(isConfirm, false);
        }
        return null;
      }, (dismiss) => {
        if (dismiss === "cancel" || dismiss === "esc" || dismiss === "overlay") {
          messageOrCallback(false, dismiss);
        }
      }).catch((err) => {
        if (err === "cancel" || err === "overlay" || err === "timer") {
          return undefined; // Silence error
        }
        throw err;
      });
    }

    const title = titleOrOptions;
    const message = messageOrCallback;

    return swal({
      useRejections: true,
      title,
      text: message,
      type: "info",
      ...options
    }).then((isConfirm) => {
      if (isConfirm === true && typeof callback === "function") {
        // eslint-disable-next-line promise/no-callback-in-promise
        callback(isConfirm);
      }
      return null;
    }).catch((err) => {
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
        return Alert[type](message, options);
      default:
        return Alert.success(message, options);
    }
  }
});
