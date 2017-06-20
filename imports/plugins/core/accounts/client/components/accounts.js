import React, { Component } from "react";
import PropTypes from "prop-types";

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

  renderAccounts() {
    if (Array.isArray(this.state.accounts)) {
      return this.state.accounts.map((account, index) => (
        <div key={index}>
          <p>{account._id}</p>
        </div>
      ));
    }
    return null;
  }

  render() {
    return (
      <div>
        {this.renderAccounts()}
      </div>
    );
  }
}

export default AccountsComponent;
