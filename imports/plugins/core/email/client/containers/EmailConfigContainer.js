import React, { Component, Fragment } from "react";
import { Reaction } from "/client/api";
import EmailConfig from "../components/EmailConfig";

export default class EmailConfigContainer extends Component {
  state = {
    configComponentName: ""
  };

  componentDidMount() {
    const emailProviders = Reaction.Apps({ provides: "emailProviderConfig" });
    if (emailProviders && emailProviders[0]) {
      const { template: configComponentName } = emailProviders[0];
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
