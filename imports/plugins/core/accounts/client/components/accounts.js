import React, { Component } from "react";
import PropTypes from "prop-types";
import AccountsTable from "./accountsTable";
import _ from "lodash";
import { Shops } from "/lib/collections";
// import { Badge, ClickToCopy, Icon, Translation } from "@reactioncommerce/reaction-ui";

class AccountsComponent extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      accounts: props.accounts
      // shopManagers: [],
      // customerServicers: [],
      // merchandisers: [],
      // fufillment: []
    };
  }

  // componentDidMount() {
  //   this.setUserGroups();
  // }

  // componentWillReceiveProps(nextProps) {
  //   this.setState({ accounts: nextProps.accounts });
  //   this.setUserGroups();
  // }

  setUserGroups() {
    // const shopManagers = [];
    // const fufillment = [];
    // const customerServicers = [];
    // const merchandisers = [];
    // const groupedUsers = [];
    console.log("ihih", this.props);
    // this.state.accounts.forEach((account) => {
    //   const userGroup = _.get(Shops.findOne(
    //     {
    //       _id: account.shopId
    //     }
    //   ), "groups").filter(group => group._id === account.groups[0].groupId[0]);
    //   if (userGroup[0]) {
    //     const groupName = userGroup[0].name;
    //     if (groupName === "Shop Manager") {
    //       shopManagers.push(account);
    //     }
    //     if (groupName === "Merchandiser") {
    //       merchandisers.push(account);
    //     }
    //     if (groupName === "Fufillment") {
    //       fufillment.push(account);
    //     }
    //     if (groupName === "Customer Service") {
    //       customerServicers.push(account);
    //     }
    //   }
    // });
    this.setState({ groups: this.props.groups });
    console.log("cfcf", this.state);
  }

  renderShopManagers(groups) {
    // const headerLabel =  { __html: "you" };
    // TODO: set default badge in here
    return Object.keys(groups).map(function (group, index) {
      if (groups[group].length > 0) {
        return (
          <div style={{ marginBottom: "10px" }} key={index}>
            <AccountsTable
              users={groups[group]}
              headerLabel={group}
            />
          </div>
        );
      }
      return null;
    });
  }
  render() {
    console.log("stateup", this.props);
    return (
      <div className="list-group">
        { this.renderShopManagers(this.props.groups)}
        {/* this.renderCustomerServicers()*/}
        {/* this.renderMerchandisers()*/}
        {/* this.renderFufillment() */}
      </div>

    );
  }
}

export default AccountsComponent;
