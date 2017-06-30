import React, { Component } from "react";
import PropTypes from "prop-types";
import AccountsTable from "./accountsTable";
import _ from "lodash";
import { Shops } from "/lib/collections";

class AccountsComponent extends Component {
  static propTypes = {
    accounts: PropTypes.array
  }

  constructor(props) {
    super(props);

    this.state = {
      accounts: props.accounts,
      shopManagers: [],
      customerServicers: [],
      merchandisers: [],
      fufillment: []
    };
  }

  componentDidMount() {
    this.setUserGroups();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ accounts: nextProps.accounts });
    this.setUserGroups();
  }

  setUserGroups() {
    const shopManagers = [];
    const fufillment = [];
    const customerServicers = [];
    const merchandisers = [];
    this.state.accounts.forEach((account) => {
      const userGroup = _.get(Shops.findOne(
        {
          _id: account.shopId
        }
      ), "groups").filter(group => group._id === account.groups[0].groupId[0]);
      if (userGroup[0]) {
        const groupName = userGroup[0].name;
        if (groupName === "Shop Manager") {
          shopManagers.push(account);
        }
        if (groupName === "Merchandiser") {
          merchandisers.push(account);
        }
        if (groupName === "Fufillment") {
          fufillment.push(account);
        }
        if (groupName === "Customer Service") {
          customerServicers.push(account);
        }
      }
    });
    this.setState(
      { shopManagers,
        customerServicers,
        fufillment,
        merchandisers
      }
    );
  }

  renderShopManagers() {
    if (this.state.shopManagers.length > 0) {
      return (
        <AccountsTable
          users={this.state.shopManagers}
          headerLabel="Shop Manager"
        />
      );
    }
    return null;
  }

  renderCustomerServicers() {
    if (this.state.customerServicers.length > 0) {
      return (
        <AccountsTable
          users={this.state.customerServicers}
          headerLabel="Customer Service"
        />
      );
    }
    return null;
  }

  renderMerchandisers() {
    if (this.state.merchandisers.length > 0) {
      return (
        <AccountsTable
          users={this.state.merchandisers}
          headerLabel="Merchandisers"
        />
      );
    }
    return null;
  }

  renderFufillment() {
    if (this.state.fufillment.length > 0) {
      return (
        <AccountsTable
          users={this.state.fufillment}
          headerLabel="Merchandisers"
        />
      );
    }
    return null;
  }


  render() {
    return (
      <div className="list-group accounts-table">
        {this.renderShopManagers()}
        {this.renderCustomerServicers()}
        {this.renderMerchandisers()}
        {this.renderFufillment()}
      </div>

    );
  }
}

export default AccountsComponent;
