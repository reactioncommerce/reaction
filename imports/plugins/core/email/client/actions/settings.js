import { Reaction, i18next } from "/client/api";

export default {

  /**
   * Open the email settings menu
   * @return {Boolean} returns true if action view toggled
   */
  toggleSettings() {
    Reaction.showActionView({
      label: "Email Settings",
      template: "emailSettings"
    });
    return true;
  },

  /**
   * Save email settings
   * @param {Object} settings - object of mail provider settings
   * @return {Boolean} returns true if all fields provided and update method called
   */
  saveSettings(settings) {
    const { service, host, port, user, password } = settings;

    if (!service) {
      const error = "Please choose a mail provider service";
      return Alerts.toast(`${i18next.t("shopSettings.shopMailSettingsFailed")} ${error}`, "error");
    }

    if (service !== "custom" && (!user || !password)) {
      const error = `SMTP user and password are required for ${service}`;
      return Alerts.toast(`${i18next.t("shopSettings.shopMailSettingsFailed")} ${error}`, "error");
    }

    if (service === "custom" && (!host || !port || !user || !password)) {
      const error = "All fields are required for a custom service!";
      return Alerts.toast(`${i18next.t("shopSettings.shopMailSettingsFailed")} ${error}`, "error");
    }

    Meteor.call("email/saveSettings", settings, (err) => {
      if (err) {
        return Alerts.toast(`${i18next.t("shopSettings.shopMailSettingsFailed")} ${err.reason}`, "error");
      }
      return Alerts.toast(i18next.t("shopSettings.shopMailSettingsSaved"), "success");
    });

    return true;
  }
};
