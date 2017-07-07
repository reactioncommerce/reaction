import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardBody } from "/imports/plugins/core/ui/client/components";


class GroupOwnerSettings extends Component {
  static propTypes = {
    accounts: PropTypes.array
  }

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  renderForm() {
    return (
        // TODO: Implement this section using the new sortable table
        <div />
    );
  }


  render() {
    return (
        <Card
          expanded={true}
        >
          <CardHeader
            actAsExpander={true}
            data-i18n="accountsUI.info.addAdminUser"
            title="Owner"
            id="accounts"
          />
          <CardBody expandable={true}>
          {this.renderForm()}
          </CardBody>
        </Card>
    );
  }
}

export default GroupOwnerSettings;
