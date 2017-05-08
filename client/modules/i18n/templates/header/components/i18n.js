import React, { Component } from "react";
import { Button, Divider, DropDownMenu, MenuItem } from "/imports/plugins/core/ui/client/components";

class LanguageDropDown extends Component {
  state = {
    value: ""
  }

  buttonElement() {
    return (
      <Button
        icon="fa fa-language fa-lg"
      />
    );
  }
  onChange = (event, value) => {
    this.setState({
      value: value
    });

    this.props.handleChange(value);
  }

  render() {
    return (
      <div>
        <DropDownMenu
          buttonElement={this.buttonElement()}
          value={this.state.value}
          onChange={this.onChange}
        >
          <MenuItem
            label="Select Currency"
            i18nKeyLabel="languages.select"
            disabled={true}
          />
          <Divider />
          {this.props.languages.length > 1 && this.props.languages.map((language) => (
            <MenuItem
              key={language.i18n}
              label={language.label}
              i18nKeyLabel={language.translation}
              value={language.i18n}
            />
          ))}
        </DropDownMenu>
      </div>
    );
  }
}

export default LanguageDropDown;
