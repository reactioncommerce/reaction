import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

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
      <Components.Button containerStyle={{ color: "#000" }}>
        <i className="fa fa-language fa-lg"/>&nbsp;
        <i className="fa fa-caret-down"/>
      </Components.Button>
    );
  }
  onChange = (event, value) => {
    this.setState({
      value
    });

    this.props.handleChange(value);
  }

  render() {
    return (
      <div>
        {this.props.languages.length > 1 &&
          <div className="dropdown-toggle">
            <Components.DropDownMenu
              buttonElement={this.buttonElement()}
              value={this.props.currentLanguage || this.state.value}
              onChange={this.onChange}
              menuStyle={{ maxHeight: 500, overflow: "auto" }}
            >
              <Components.MenuItem
                label="Select language"
                i18nKeyLabel="languages.select"
                disabled={true}
              />
              <Components.Divider />
              {this.props.languages.map((language) => (
                <Components.MenuItem
                  key={language.i18n}
                  label={language.label}
                  i18nKeyLabel={language.translation}
                  value={language.i18n}
                />
              ))}
            </Components.DropDownMenu>
          </div>
        }
      </div>
    );
  }
}

export default LanguageDropDown;
