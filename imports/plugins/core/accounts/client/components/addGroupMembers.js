import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardBody, List, ListItem } from "/imports/plugins/core/ui/client/components";

class AddGroupMembers extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.object
  }

  render() {
    return (
      <Card expanded={true}>
        <CardHeader
          actAsExpander={true}
          data-i18n=""
          title="Owner"
        />
        <CardBody expandable={true}>
          <List>
            {this.props.accounts.map((acc, index) => <ListItem key={index} label={acc.name} />)}
          </List>
        </CardBody>
      </Card>
    );
  }
}

export default AddGroupMembers;
