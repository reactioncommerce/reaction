import React, { Component } from "react";
import PropTypes from "prop-types";
import AccountsTable from "./accountsTable";

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

  // renderAccountList() {
  //   if (Array.isArray(this.state.accounts)) {
  //     return this.state.accounts.map((account, index) => (
  //         <ListItem
  //           key={index}
  //           actionType="arrow"
  //           label="My List Item 2"
  //         />
  //     ));
  //   }
  //   return null;
  // }


  render() {
    return (
      <div className="list-group">
        <AccountsTable
          users={this.state.accounts}
          headerLabel="Shop Manager"
        />
        <AccountsTable
          users={this.state.accounts}
          headerLabel="Guest"
        />
      </div>

    );
  }
}

export default AccountsComponent;
