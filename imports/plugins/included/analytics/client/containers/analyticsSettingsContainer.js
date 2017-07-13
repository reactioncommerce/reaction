import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import AnalyticsSettings from "../components/settings";

class AnalyticsSettingsContainer extends Component {
  handleSave = (settingName, values) => {
    Meteor.call("reaction-analytics/updateAnalyticsSettings", values.settings, (error) => {
      if (!error) {
        Alerts.toast(
          i18next.t("admin.settings.analyticsSettingsSaved", { defaultValue: "Analytics settings saved" }),
          "success"
        );
      }
    });
  }

  render() {
    return (
      <AnalyticsSettings
        onSave={this.handleSave}
        onToggle={this.handleToggle}
        {...this.props}
      />
    );
  }
}

const composer = (props, onData) => {
  const pkgSub = Reaction.Subscriptions.Packages;
  const packageData = Packages.findOne({
    name: "reaction-analytics"
  });
  if (pkgSub.ready()) {
    onData(null, { packageData });
  }
};

export default composeWithTracker(composer)(AnalyticsSettingsContainer);
