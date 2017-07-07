import React, { Component } from "react";
import PropTypes from "prop-types";
import AccountsTable from "./accountsTable";
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
    };
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
    return (
      <div className="list-group accounts-table">
        { this.renderShopManagers(this.props.groups)}
      </div>

    );
  }
}

export default AccountsComponent;
