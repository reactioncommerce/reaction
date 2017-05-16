import React, { Component, PropTypes } from "react";
import BrandContainer from "../containers/brandContainer";
import { FlatButton } from "/imports/plugins/core/ui/client/components";
import { NotificationContainer } from "/imports/plugins/included/notifications/client/containers";

class NavBar extends Component {
  constructor(props) {
    super(props);
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

  render() {
    return (
      <div>
        <div>
          <BrandContainer />
        </div>
        {this.renderSearchButton()}
        {this.renderNotificationIcon()}
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
