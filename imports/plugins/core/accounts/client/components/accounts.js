import React, { Component } from "react";
import PropTypes from "prop-types";
import { List, ListItem } from "/imports/plugins/core/ui/client/components";

class AccountsComponent extends Component {
  static propTypes = {
    accounts: PropTypes.array
  }

  constructor(props) {
    super(props);

    this.state = {
      accounts: props.accounts
    };
  }

  renderAccountList() {
    if (Array.isArray(this.state.accounts)) {
      return this.state.accounts.map((account, index) => (
          <ListItem
            key={index}
            actionType="arrow"
            label="My List Item 2"
          />
      ));
    }
    return null;
  }

  render() {
    return (
      <List >
        {this.renderAccountList()}
      </List>
    );
  }
}

export default AccountsComponent;
