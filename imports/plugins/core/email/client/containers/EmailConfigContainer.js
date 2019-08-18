/* eslint-disable react/no-did-mount-set-state */
/* TODO: revisit this component and convert to functional component to remove need for state */
import React, { Component, Fragment } from "react";
import { Reaction } from "/client/api";
import EmailConfig from "../components/EmailConfig";

export default class EmailConfigContainer extends Component {
  state = {
    configComponentName: ""
  };

  componentDidMount() {
    // Load plugins that provide an email provider config component
    let emailProviderPlugins = Reaction.Apps({ provides: "emailProviderConfig" });

    // If more then one plugin provides emailProviderConfig, use first non-core plugin (core is reaction-email-smtp)
    let emailProviderPlugin;
    if (emailProviderPlugins && emailProviderPlugins.length) {
      if (emailProviderPlugins.length === 1) {
        [emailProviderPlugin] = emailProviderPlugins;
      } else {
        emailProviderPlugins = emailProviderPlugins.filter((plugin) => plugin.packageName !== "reaction-email-smtp");
        [emailProviderPlugin] = emailProviderPlugins;
      }
    }

    if (emailProviderPlugin) {
      const { template: configComponentName } = emailProviderPlugin;
      this.setState({ configComponentName });
    }
  }

  render() {
    const { configComponentName } = this.state;
    return (
      <Fragment>
        <EmailConfig configComponentName={configComponentName} />
      </Fragment>
    );
  }
}
