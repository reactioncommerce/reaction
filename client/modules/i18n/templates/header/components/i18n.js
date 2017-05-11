import React, { Component, PropTypes } from "react";
import { Button, Divider, DropDownMenu, MenuItem } from "/imports/plugins/core/ui/client/components";

class LanguageDropDown extends Component {
  static propTypes = {
    currentLanguage: PropTypes.string,
    handleChange: PropTypes.func,
    languages: PropTypes.array
  }

  state = {
    value: ""
  }

  buttonElement() {
    return (
      <Button>
        <i className="fa fa-language fa-lg"/>&nbsp;
        <i className="fa fa-caret-down"/>
      </Button>
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
        {this.props.languages.length > 1 &&
          <div className="dropdown-toggle">
              <DropDownMenu
                buttonElement={this.buttonElement()}
                value={this.props.currentLanguage || this.state.value}
                onChange={this.onChange}
              >
                <MenuItem
                  label="Select Currency"
                  i18nKeyLabel="languages.select"
                  disabled={true}
                />
                <Divider />
                {this.props.languages.map((language) => (
                  <MenuItem
                    key={language.i18n}
                    label={language.label}
                    i18nKeyLabel={language.translation}
                    value={language.i18n}
                  />
                ))}
              </DropDownMenu>
          </div>
        }
      </div>
    );
  }
}

export default LanguageDropDown;
