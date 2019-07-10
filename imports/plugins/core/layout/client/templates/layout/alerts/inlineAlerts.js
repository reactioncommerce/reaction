import _ from "lodash";
import { i18next } from "/client/api";
import { Mongo } from "meteor/mongo";

/*
 * Forked and modifed from https://github.com/asktomsk/bootstrap-alerts/
 */
const Alerts = {

  /*
  Default options. Can be overridden for application
   */
  defaultOptions: {

    /*
    Button with cross icon to hide (close) alert
     */
    dismissable: true,

    /*
    CSS classes to be appended on each alert DIV (use space for separator)
     */
    classes: "",

    /*
    Hide alert after delay in ms or false to infinity
     */
    autoHide: false,

    /*
    Time in ms before alert fully appears
     */
    fadeIn: 200,

    /*
    If autoHide enabled then fadeOut is time in ms before alert disappears
     */
    fadeOut: 3000,

    /*
    Amount of alerts to be displayed
     */
    alertsLimit: 3,

    /*
    Allows use HTML in messages
     */
    html: false,

    /*
     * define placement to only show where matches
     * use: {{inlineAlerts placement="cart"}}
     * Alerts.add "message","danger", placement:"cart"
     */
    placement: "",

    /*
    Translation key for i18n (translations collection)
     */
    i18nKey: "",

    /*
    unique id (for multiple message placements)
     */
    id: ""
  },

  /*
  Add an alert

  @param message (String) Text to display.
  @param mode (String) One of bootstrap alerts types: success, info, warning, danger
  @param options (Object) Options if required to override some of default ones.
  See Alerts.defaultOptions for all values.
   */
  add(alertMessage, mode, alertOptions) {
    let alert;
    let message = alertMessage;
    let options = alertOptions;
    // check options to see if we have translation
    if (options && options.i18nKey && options.i18nKey !== i18next.t(options.i18nKey)) {
      message = i18next.t(options.i18nKey);
    }
    // get default options
    options = _.defaults(alertOptions || {}, Alerts.defaultOptions);

    if (options.type) {
      alert = Alerts.collection_.findOne({
        "options.type": options.type
      });
      if (alert) {
        Alerts.collection_.update(alert._id, {
          $set: {
            message,
            mode,
            options
          }
        });
        return;
      }
    }

    const count = Alerts.collection_.find({}).count();
    if (count >= options.alertsLimit) {
      Alerts.collection_.find({}, {
        sort: {
          created: -1
        },
        skip: options.alertsLimit - 1
      }).forEach((row) => {
        Alerts.collection_.remove(row._id);
      });
    }
    Alerts.collection_.insert({
      message,
      mode,
      options,
      seen: false,
      created: +new Date()
    });
  },

  /*
  Call this function before loading a new page to clear errors from previous page
  Best way is using Router filtering feature to call this function
   */
  removeSeen() {
    Alerts.collection_.remove({
      "seen": true,
      "options.sticky": {
        $ne: true
      }
    });
  },

  /*
  If you provide a `type` option when adding an alert, you can call this function
  to later remove that alert.
   */
  removeType(type) {
    Alerts.collection_.remove({
      "options.type": type
    });
  },
  collection_: new Mongo.Collection(null)
};

window.Alerts = Alerts;
export default Alerts;
