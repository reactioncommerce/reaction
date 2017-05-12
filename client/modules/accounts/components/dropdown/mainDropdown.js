import React, { Component } from "react";
import { Button, Divider, DropDownMenu, MenuItem } from "/imports/plugins/core/ui/client/components";

class MainDropdown extends Component {
  buttonElement() {
    return (
      <Button
        label="Hey"
      >

      </Button>
    )
  }
  render() {
    return (
      <div>
        <DropDownMenu
          buttonElement={this.buttonElement()}
        >
        <MenuItem>  Number 1</MenuItem>

        </DropDownMenu>
      </div>
    );
  }
}

export default MainDropdown;
