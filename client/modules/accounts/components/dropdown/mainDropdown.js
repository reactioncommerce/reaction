import React, { Component } from "react";
import { Button, DropDownMenu, MenuItem } from "/imports/plugins/core/ui/client/components";

class MainDropdown extends Component {
  buttonElement() {
    return (
      <Button>
        <span id="logged-in-display-name"> {this.props.userName}<b className="caret" /></span>
      </Button>
    );
  }
  render() {
    return (
      <div>
        {this.props.currentUser &&
          <DropDownMenu
            buttonElement={this.buttonElement()}
          >
          <div className="user-accounts-dropdown">
            <div className="user-accounts-dropdown-content">
                <MenuItem>  Number 1</MenuItem>
            </div>

            <div className="btn btn-primary btn-block" id="logout" data-i18n="accountsUI.signOut">Sign Out</div>
          </div>
          </DropDownMenu>
        }
      </div>
    );
  }
}

export default MainDropdown;
