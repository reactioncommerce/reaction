import React, { Component, PropTypes } from "react";
import { Button, DropDownMenu, MenuItem } from "/imports/plugins/core/ui/client/components";
import { Reaction } from "/client/api";
import { Meteor } from "meteor/meteor";
import { Tags } from "/lib/collections";
import { Roles } from "meteor/alanning:roles";

class MainDropdown extends Component {
  static propTypes = {
    currentUser: PropTypes.oneOfType(
      [PropTypes.bool, PropTypes.object]
    ),
    userImage: PropTypes.string,
    userName: PropTypes.string
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
  reactionAppsOptions() {
    // get shortcuts with audience permissions based on user roles
    const roles = Roles.getRolesForUser(Meteor.userId(), Reaction.getShopId());

    return {
      provides: "shortcut",
      enabled: true,
      audience: roles
    };
  }

  handleChange = (event, value) => {
    event.preventDefault();

    // if (value === "logout") {
    //   return Meteor.logout((error) => {
    //     if (error) {
    //       Logger.warn("Failed to logout.", error);
    //     }
    //   });
    // }

    if (value.name === "createProduct") {
      Reaction.setUserPreferences("reaction-dashboard", "viewAs", "administrator");
      Meteor.call("products/createProduct", (error, productId) => {
        if (Meteor.isClient) {
          let currentTag;
          let currentTagId;

          if (error) {
            throw new Meteor.Error("createProduct error", error);
          } else if (productId) {
            currentTagId = Session.get("currentTag");
            currentTag = Tags.findOne(currentTagId);
            if (currentTag) {
              Meteor.call("products/updateProductTags", productId, currentTag.name, currentTagId);
            }
            // go to new product
            Reaction.Router.go("product", {
              handle: productId
            });
          }
        }
      });
    } else if (value.name !== "account/profile") {
      return Reaction.showActionView({
        i18nKeyLabel: value.i18nKeyLabel,
        label: value.label,
        template: value.template,
        provides: "dashboard"
      });
    } else {
      return Reaction.Router.go(value.name || value.route);
    }

    // return Reaction.Router.go(value);
  }

  handleLogout = (event, value) => {
    Meteor.logout((error) => {
      if (error) {
        Logger.warn("Failed to logout.", error);
      }
    });
  }

  render() {
    const options = {
      provides: "userAccountDropdown",
      enabled: true
    };

    return (
      <div>
        {this.props.currentUser &&
          <DropDownMenu
            buttonElement={this.buttonElement()}
            attachment="bottom right"
            targetAttachment="top right"
            menuStyle={{
              padding: 10,
              minWidth: 220,
              minHeight: 50
            }}
            className="accounts-li-tag"
            onChange={this.handleChange}
          >
            {
              Reaction.Apps(options).map((option) => (
                <MenuItem
                  key={option.packageId}
                  className="accounts-a-tag"
                  label={option.label}
                  i18nKeyLabel={option.i18nKeyLabel}
                  icon={option.icon}
                  iconStyle={{
                    margin: "10px 10px 10px 6px",
                    width: "20px",
                    fontSize: "inherit",
                    textAlign: "center"
                  }}
                  value={option}
                />
              ))
            }
            {
              Reaction.Apps(this.reactionAppsOptions()).map((shortcut) => (
                <MenuItem
                  key={shortcut.packageId}
                  className="accounts-a-tag"
                  label={shortcut.label}
                  i18nKeyLabel={shortcut.i18nKeyLabel}
                  icon={shortcut.icon}
                  iconStyle={{
                    margin: "10px 10px 10px 6px",
                    width: "20px",
                    fontSize: "inherit",
                    textAlign: "center"
                  }}
                  value={shortcut}
                />
            ))}

            <div
              className="btn btn-primary btn-block"
              id="logout"
              // value="logout"
              data-i18n="accountsUI.signOut"
              style={{ padding: 5 }}
            >
              Sign Out
            </div>
          </DropDownMenu>
        }
      </div>
    );
  }
}

export default MainDropdown;
