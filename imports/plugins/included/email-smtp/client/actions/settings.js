import _ from "lodash";
import { Meteor } from "meteor/meteor";
import Alert from "sweetalert2";
import { i18next } from "/client/api";

export default {
  /**
   * Save email settings
   * @param {Object} settings - object of mail provider settings
   * @param {Function} callback - optional callback
   * @return {Boolean} returns true if all fields provided and update method called
   */
  saveSettings(settings, callback) {
    const { service, host, port, user, password } = settings;

    if (!service) {
      Alert(i18next.t("app.error"), i18next.t("mail.alerts.missingService"), "error");
      return callback();
    }

    if (service !== "custom" && service !== "Maildev" && (!user || !password)) {
      Alert(i18next.t("app.error"), i18next.t("mail.alerts.userPassRequired", { service }), "error");
      return callback();
    }

    if (service === "custom" && (!host || !port)) {
      Alert(i18next.t("app.error"), i18next.t("mail.alerts.allFieldsRequired"), "error");
      return callback();
    }

    // make sure port is a Number
    settings.port = Number(settings.port);

    if (isNaN(settings.port)) {
      Alert(i18next.t("app.error"), i18next.t("mail.alerts.portNaN"), "error");
      return callback();
    }

    const save = () => {
      Meteor.call("email/saveSettings", _.pick(settings, ["service", "host", "port", "user", "password"]), (err) => {
        if (err) {
          return Alert(
            i18next.t("app.error"),
            i18next.t("mail.alerts.saveFailed", { error: err.reason }),
            "error"
          );
        }
        return Alert({
          title: i18next.t("app.success"),
          text: i18next.t("mail.alerts.saveSuccess"),
          type: "success",
          timer: 1700
        }).catch(() => null);
      });
    };

    // check if the settings work first
    Meteor.call("email/verifySettings", settings, (error) => {
      callback();
      // if the connection fails
      if (error) {
        Alert({
          title: i18next.t("mail.alerts.connectionFailed"),
          text: i18next.t("mail.alerts.saveAnyway"),
          type: "warning",
          showCancelButton: true,
          cancelButtonText: i18next.t("app.cancel"),
          confirmButtonColor: "#DD6B55",
          confirmButtonText: i18next.t("app.save")
        }).then(() => save()).catch(() => true);
      } else {
        save();
      }
    });

    return true;
  }
};
