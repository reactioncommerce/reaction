import { Packages } from "/lib/collections";
import { i18next } from "/client/api";

Template.reactionAnalyticsSettings.helpers({
  packageData() {
    return Packages.findOne({
      name: "reaction-analytics"
    });
  },
  googleAnalyticsEnabled() {
    return typeof ga === "function";
  },
  segmentioEnabled() {
    return typeof analytics === "object";
  },
  mixpanelEnabled() {
    return typeof mixpanel === "object";
  }
});


AutoForm.hooks({
  "analytics-update-form": {
    onSuccess() {
      Alerts.removeType("analytics-not-configured");
      return Alerts.toast(i18next.t("admin.settings.analyticsSettingsSaved"), "success");
    },
    onError(operation, error) {
      const msg = error.message || error.reason || "Unknown error";
      return Alerts.toast(`${i18next.t("admin.settings.analyticsSettingsFailed")} ${msg}`, "error");
    }
  }
});
