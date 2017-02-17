import React, { Component, PropTypes } from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";
import { SocialSettings } from "../components";
import { createSocialSettings } from "../../lib/helpers";
import debounce from "lodash/debounce";

class SocialSettingsContainer extends Component {
  static propTypes = {
    settings: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings
    };

    this.debounceUpdateField = debounce((provider, field, value) => {
      Meteor.call("reaction-social/updateSocialSetting", provider, field, value);
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      settings: nextProps.settings
    });
  }

  handleSettingEnable = (event, isChecked, name) => {
    Meteor.call("reaction-social/updateSocialSetting", name, "enabled", isChecked);
  }

  handleSettingChange = (provider, field, value) => {
    const apps = {
      ...this.state.settings.apps,
      [provider]: {
        ...this.state.settings.apps[provider],
        [field]: value
      }
    };

    this.setState({
      settings: {
        ...this.state.settings,
        apps
      }
    }, () => {
      this.debounceUpdateField(provider, field, value);
    });
  }

  render() {
    return (
      <SocialSettings
        onSettingEnableChange={this.handleSettingEnable}
        onSettingChange={this.handleSettingChange}
        {...this.props}
        settings={this.state.settings}
      />
    );
  }
}

function composer(props, onData) {
  const subscription = Reaction.Subscriptions.Packages;

  if (subscription.ready()) {
    const socialSettings = createSocialSettings(props);
    onData(null, socialSettings);
  } else {
    onData(null, {});
  }
}

const decoratedComponent = composeWithTracker(composer)(SocialSettingsContainer);

export default decoratedComponent;
