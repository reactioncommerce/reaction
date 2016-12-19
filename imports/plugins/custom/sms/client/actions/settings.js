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
    const { apiKey, apiToken, smsProvider, smsPhone } = settings;

    if (!apiKey) {
      Alert("Warning", "Please add an API Key", "error");
      return callback();
    }
    if (!apiToken) {
      Alert("Warning", "Please add an API Tpken/Secret", "error");
      return callback();
    }
    if (!smsProvider) {
      Alert("Warning", "Please choose an sms provider", "error");
      return callback();
    }
    if (!smsPhone) {
      Alert("Warning", "Please add the phone number given to you by your sms provider", "error");
      return callback();
    }

    const save = () => {
      Meteor.call("sms/saveSettings", settings, (err) => {
        if (err) {
          return Alert(i18next.t("app.error"),
           "Your API credentials could not be saved",
            "error");
        }
        return Alert({
          title: i18next.t("app.success"),
          text: "Sms Settings saved",
          type: "success",
          timer: 1700
        }).catch(() => null);
      });
    };
    save();
    return true;
  }
};
