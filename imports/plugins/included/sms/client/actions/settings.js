import Alert from "sweetalert2";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";

export default {

  /**
   * Save email settings
   * @param {Object} settings - object of mail provider settings
   * @return {Promise<undefined>}
   */
  saveSettings(settings) {
    return new Promise((resolve) => {
      Meteor.call("sms/saveSettings", settings, (err) => {
        resolve();

        if (err) {
          Alert(
            i18next.t("app.error"),
            "Your API credentials could not be saved",
            "error"
          );
          return;
        }

        Alert({
          title: i18next.t("app.success"),
          text: i18next.t("admin.alerts.saveSuccess"),
          type: "success",
          timer: 1700
        });
      });
    });
  }
};
