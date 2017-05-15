import React, { Component } from "react";
import { Button, Divider, DropDownMenu, MenuItem } from "/imports/plugins/core/ui/client/components";
import { Reaction } from "/client/api";
import { Roles } from "meteor/alanning:roles";

class MainDropdown extends Component {
  buttonElement() {
    return (
      <Button>
        <img className="circular-icon" src={this.props.userImage} alt="" />&nbsp;
        <span>{this.props.userName}</span>&nbsp;
        <i className="fa fa-caret-down" />
      </Button>
    );
  }
  reactionAppsOptions() {
    // get shortcuts with audience permissions based on user roles
    const roles = Roles.getRolesForUser(Meteor.userId(), Reaction.getShopId());

    return {
      provides: "shortcut",
      enabled: true,
      audience: roles
    };
  }
  render() {
    console.log("message", Reaction.Apps(this.reactionAppsOptions()));
    return (
      <div>
        {this.props.currentUser &&
          <DropDownMenu
            buttonElement={this.buttonElement()}
            style={{
              padding: 10,
              minWidth: 220,
              minHeight: 50
            }}
            className="accounts-li-tag"
          >
            {Reaction.Apps(this.reactionAppsOptions()).map((shortcut) => (
              <div key={shortcut.packageId}>
                <MenuItem
                  className="accounts-a-tag"
                  label={shortcut.label}
                  i18nKeyLabel={shortcut.i18nKeyLabel}
                  icon={shortcut.icon}
                  value={shortcut.name}
                />
              </div>
            ))}

            <div className="btn btn-primary btn-block" id="logout" data-i18n="accountsUI.signOut" style={{ padding: 5 }}>Sign Out</div>
          </DropDownMenu>
        }
      </div>
    );
  }
}

export default MainDropdown;
