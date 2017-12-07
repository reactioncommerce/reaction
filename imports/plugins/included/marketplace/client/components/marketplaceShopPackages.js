import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class MarketplaceShopPackages extends Component {
  static propTypes = {
    handleToggle: PropTypes.func,
    packages: PropTypes.array,
    shopId: PropTypes.string
  }

  handleToggle = (event, status, pkgName) => {
    this.props.handleToggle(status, pkgName, this.props.shopId);
  }

  get allPackages() {
    return this.props.packages.map((pkg) => pkg.name);
  }

  handleAllOn = (event, status) => {
    this.props.handleToggle(status, this.allPackages, this.props.shopId);
  }

  handleAllOff = (event, status) => {
    this.props.handleToggle(status, this.allPackages, this.props.shopId);
  }

  renderPackageList() {
    if (this.props.packages.length) {
      return this.props.packages.map((pkg) => {
        const pkgLabel = pkg.registry.find((reg) => {
          if (reg.provides && reg.provides.indexOf("dashboard") > -1) {
            return true;
          }
          if (reg.provides && reg.provides.indexOf("actions") > -1) {
            return true;
          }
          if (reg.provides && reg.provides.indexOf("settings") > -1) {
            return true;
          }
          return false;
        });

        return (
          <Components.ListItem
            label={pkgLabel.label}
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
      <div className="shop-package-setting">
        <Components.Card>
          <Components.CardHeader
            actAsExpander={true}
            data-i18n=""
            title="Manage Shop Packages"
            id="accounts"
          />
          <Components.CardBody expandable={true}>
            <Components.CardToolbar>
              <Components.FlatButton
                i18nKeyLabel={"admin.i18nSettings.allOn"}
                label="All On"
                value={true}
                onClick={this.handleAllOn}
              />
              { "|" }
              <Components.FlatButton
                i18nKeyLabel={"admin.i18nSettings.allOff"}
                label="All Off"
                value={false}
                onClick={this.handleAllOff}
              />
            </Components.CardToolbar>
            {this.renderPackageList()}
          </Components.CardBody>
        </Components.Card>
      </div>
    );
  }
}

export default MarketplaceShopPackages;
