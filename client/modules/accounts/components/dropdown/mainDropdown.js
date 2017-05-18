import React, { Component, PropTypes } from "react";
import { Reaction } from "/client/api";
import { Button, DropDownMenu, MenuItem } from "/imports/plugins/core/ui/client/components";

const iconStyle = {
  margin: "10px 10px 10px 6px",
  width: "20px",
  fontSize: "inherit",
  textAlign: "center"
};

const menuStyle = {
  padding: 10,
  minWidth: 220,
  minHeight: 50
};

class MainDropdown extends Component {
  static propTypes = {
    adminShortcuts: PropTypes.object,
    currentUser: PropTypes.oneOfType(
      [PropTypes.bool, PropTypes.object]
    ),
    handleChange: PropTypes.func,
    userImage: PropTypes.oneOfType(
      [PropTypes.bool, PropTypes.string]
    ),
    userName: PropTypes.string,
    userShortcuts: PropTypes.object
  }

  buttonElement() {
    return (
      <Button>
        <img className="accounts-img-tag" src={this.props.userImage} />&nbsp;
        <span>{this.props.userName}</span>&nbsp;
        <i className="fa fa-caret-down" />
      </Button>
    );
  }

  renderAdminIcons() {
    return (
      Reaction.Apps(this.props.adminShortcuts).map((shortcut) => (
        <MenuItem
          key={shortcut.packageId}
          className="accounts-a-tag"
          label={shortcut.label}
          i18nKeyLabel={shortcut.i18nKeyLabel}
          icon={shortcut.icon}
          iconStyle={iconStyle}
          value={shortcut}
        />
      ))
    );
  }

  renderUserIcons() {
    return (
      Reaction.Apps(this.props.userShortcuts).map((option) => (
        <MenuItem
          key={option.packageId}
          className="accounts-a-tag"
          label={option.label}
          i18nKeyLabel={option.i18nKeyLabel}
          icon={option.icon && option.icon}
          iconStyle={iconStyle}
          value={option}
        />
      ))
    );
  }

  renderSignOutButton() {
    return (
      <MenuItem
        className="btn btn-primary btn-block accounts-btn-tag"
        label="Sign out"
        value="logout"
      />
    );
  }

  render() {
    return (
      <div style={{ paddingRight: 5 }}>
        {this.props.currentUser ?
          <DropDownMenu
            buttonElement={this.buttonElement()}
            attachment="bottom right"
            targetAttachment="top right"
            menuStyle={menuStyle}
            className="accounts-li-tag"
            onChange={this.props.handleChange}
          >

            {this.renderUserIcons()}
            {this.renderAdminIcons()}
            {this.renderSignOutButton()}

          </DropDownMenu> :
          <DropDownMenu
            buttonElement={
              <Button label="Sign In">
                &nbsp;<i className="fa fa-caret-down" />
              </Button>
            }
            attachment="bottom right"
            targetAttachment="top right"
          />
        }
      </div>
    );
  }
}

export default MainDropdown;
