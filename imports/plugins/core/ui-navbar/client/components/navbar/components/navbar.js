import React, { Component, PropTypes } from "react";
import BrandContainer from "../containers/brandContainer";
import { FlatButton } from "/imports/plugins/core/ui/client/components";
import { NotificationContainer } from "/imports/plugins/included/notifications/client/containers";
import CartIconContainer from "/imports/plugins/core/checkout/client/container/cartIconContainer.js";
import CartPanel from "/imports/plugins/core/checkout/client/templates/cartPanel/container/cartPanelContainer.js";

class NavBar extends Component {
  constructor(props) {
    super(props);
  }

  renderBrandContainer() {
    return (
      <div>
        <BrandContainer />
      </div>
    );
  }

  renderSearchButton() {
    if (this.props.isSearchEnabled()) {
      return (
        <div className="search">
          <FlatButton
            icon={this.props.icon}
            kind={this.props.kind}
          />
        </div>
      );
    }
  }

  renderNotificationIcon() {
    if (this.props.hasProperPermission) {
      return (
        <div>
          <NotificationContainer />
        </div>
      );
    }
  }

  renderCartContainerAndPanel() {
    return (
      <div className="cart-container">
        <div className="cart">
          <CartIconContainer />
        </div>
        <div className="cart-alert">
          <CartPanel />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderBrandContainer()}
        {this.renderSearchButton()}
        {this.renderNotificationIcon()}
        {this.renderCartContainerAndPanel()}
      </div>
    );
  }
}

NavBar.propTypes = {
  hasProperPermission: PropTypes.bool,
  icon: PropTypes.string,
  isSearchEnabled: PropTypes.func,
  kind: PropTypes.string
};

export default NavBar;
