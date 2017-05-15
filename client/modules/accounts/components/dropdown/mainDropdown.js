import React, { Component } from "react";
import { Button, Divider, DropDownMenu, Menu, MenuItem } from "/imports/plugins/core/ui/client/components";
import { Reaction } from "/client/api";
import { Roles } from "meteor/alanning:roles";

class MainDropdown extends Component {
  buttonElement() {
    return (
      <Button
        label={this.props.userName}
      >
        &nbsp;<i className="fa fa-caret-down" />
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
          >
            {Reaction.Apps(this.reactionAppsOptions()).map((shortcut) => (
              <div key={shortcut.packageId}>
                <MenuItem
                  label={shortcut.label}
                  i18nKeyLabel={shortcut.i18nKeyLabel}
                  icon={shortcut.icon}
                  value={shortcut.name}

                />
                <Divider />
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
