import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

export default class EmailConfig extends Component {
  static propTypes = {
    configComponentName: PropTypes.string
  };

  render() {
    const { configComponentName } = this.props;

    let ConfigComponent;
    if (configComponentName) {
      ConfigComponent = Components[configComponentName];
    }

    return (
      <Components.CardGroup>
        <Components.Card>
          <Components.CardHeader
            actAsExpander={true}
            i18nKeyTitle="admin.settings.mailProvider"
            title="Mail Provider"
          />
          <Components.CardBody expandable={true}>
            {ConfigComponent && (<ConfigComponent />)}
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }
}
