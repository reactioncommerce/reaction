import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import AnalyticsSettings from "../components/settings";

class AnalyticsSettingsContainer extends Component {
  static propTypes = {
    enabled: PropTypes.object,
    packageData: PropTypes.object
  }

  handleToggle = (event, isChecked, name) => {
    Meteor.call("reaction-analytics/updateStatus", name, "enabled", isChecked);
  }

  handleSave = (settingName, values) => {
    const data = values.settings.public[settingName].api_key;

    if (data) {
      Meteor.call("reaction-analytics/updateAnalyticsSettings", data, settingName);
    } else {
      Alerts.toast(
        i18next.t("admin.settings.noApiKeyProvided", { defaultValue: `No value provided for ${settingName} settings` }),
        "error"
      );
    }
  }

  render() {
    return (
      <AnalyticsSettings
        onSave={this.handleSave}
        handleToggle={this.handleToggle}
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
