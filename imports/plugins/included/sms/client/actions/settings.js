import Alert from "sweetalert2";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";

export default {

  /**
   * Save email settings
   * @param {Object} settings - object of mail provider settings
   * @param {Function} callback - optional callback
   * @return {Boolean} returns true if all fields provided and update method called
   */
  saveSettings(settings, callback) {
    const { apiKey, apiToken, smsProvider, smsPhone } = settings;

    if (!apiKey) {
      Alert(i18next.t("app.error"), i18next.t("admin.alerts.noApiKey"), "error");
      return callback();
    }
    if (!apiToken) {
      Alert(i18next.t("app.error"), i18next.t("admin.alerts.noApiToken"), "error");
      return callback();
    }
    if (!smsProvider) {
      Alert(i18next.t("app.error"), i18next.t("admin.alerts.noSmsProvider"), "error");
      return callback();
    }
    if (!smsPhone) {
      Alert(i18next.t("app.error"), i18next.t("admin.alerts.noSmsPhone"), "error");
      return callback();
    }

    const save = () => {
      Meteor.call("sms/saveSettings", settings, (err) => {
        if (err) {
          return Alert(
            i18next.t("app.error"),
            "Your API credentials could not be saved",
            "error"
          );
        }
        return Alert({
          title: i18next.t("app.success"),
          text: i18next.t("admin.alerts.saveSuccess"),
          type: "success",
          timer: 1700
        }).catch(() => null);
      });
    };
    save();
    return callback();
  }
};
