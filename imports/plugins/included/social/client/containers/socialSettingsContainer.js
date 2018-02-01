import React, { Component } from "react";
import PropTypes from "prop-types";
import { isEqual } from "lodash";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { SocialSettings } from "../components";
import { createSocialSettings } from "../../lib/helpers";

class SocialSettingsContainer extends Component {
  static propTypes = {
    settings: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings
    };
  }

  componentWillReceiveProps(nextProps) {
    if (isEqual(nextProps.settings, this.props.settings) === false) {
      this.setState({
        settings: nextProps.settings
      });
    }
  }

  handleSettingEnable = (event, isChecked, name) => {
    Meteor.call("reaction-social/updateSocialSetting", name, "enabled", isChecked);
  }

  handleSettingExpand = (event, card, name, isExpanded) => {
    Reaction.updateUserPreferences("reaction-social", "settingsCards", {
      [name]: isExpanded
    });
  }

  handleSettingsSave = (settingName, values) => {
    Meteor.call("reaction-social/updateSocialSettings", values.settings, (error) => {
      if (!error) {
        Alerts.toast(
          i18next.t("admin.settings.socialSettingsSaved", { defaultValue: "Social settings saved" }),
          "success"
        );
      }
    });
  }

  render() {
    return (
      <SocialSettings
        onSettingEnableChange={this.handleSettingEnable}
        onSettingExpand={this.handleSettingExpand}
        onSettingsSave={this.handleSettingsSave}
        {...this.props}
        settings={this.state.settings}
      />
    );
  }
}

function composer(props, onData) {
  const subscription = Reaction.Subscriptions.Packages;
  const preferences = Reaction.getUserPreferences("reaction-social", "settingsCards", {});

  const socialPackage = Packages.findOne({
    name: "reaction-social"
  });

  if (subscription.ready()) {
    onData(null, {
      preferences,
      packageData: socialPackage,
      socialSettings: createSocialSettings(props)
    });
  } else {
    onData(null, {});
  }
}

const decoratedComponent = composeWithTracker(composer)(SocialSettingsContainer);

export default decoratedComponent;
