import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class MarketplaceShopPackages extends Component {
  static propTypes = {
    handleToggle: PropTypes.func,
    packages: PropTypes.array
  }

  handleToggle = (event, status, pkgName) => {
    this.props.handleToggle(status, pkgName);
  }

  renderPackageList() {
    if (this.props.packages.length) {
      return this.props.packages.map((pkg) => {
        return (
          <Components.ListItem
            label={pkg.name}
            key={pkg._id}
            actionType="switch"
            switchOn={pkg.enabled}
            switchName={pkg.name}
            onSwitchChange={this.handleToggle}
          />
        );
      });
    }

    return null;
  }

  render() {
    return (
      <Components.Card>
        <Components.CardHeader
          actAsExpander={true}
          data-i18n=""
          title="Manage Shop Packages"
          id="accounts"
        />
        <Components.CardBody expandable={true}>
          <div className="rui panel-body">
            {this.renderPackageList()}
          </div>
        </Components.CardBody>
      </Components.Card>
    );
  }
}

export default MarketplaceShopPackages;
