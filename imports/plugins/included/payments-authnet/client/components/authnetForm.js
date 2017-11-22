import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form } from "/imports/plugins/core/ui/client/components";
import { Components } from "@reactioncommerce/reaction-components";

/**
 * @file AuthnetSettingsForm - React Component wrapper for Authnet settings form
 * @module AuthnetSettingsForm
 * @extends Component
*/
class AuthnetSettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      configSchema: props.schema,
      settings: props.settings
    };
    this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  /**
   * @name handleCheckboxSelect()
   * @summary Handle checkbox selection
   * @param {any} event
   * @param {Booolean} isChecked
   * @param {String} name
   * @return {function} state for field value
  */
  handleCheckboxSelect(event, isChecked, name) {
    const { settings } = this.state;
    const { support } = settings["reaction-auth-net"];
    const checked = [...support];

    if (isChecked) {
      checked.push(name);
    } else {
      const index = checked.indexOf(name);
      if (index > -1) {
        checked.splice(index, 1);
      }
    }

    const update = Object.assign({},
      settings["reaction-auth-net"],
      { support: checked });

    this.setState((prevState) => {
      return {
        settings: Object.assign({}, prevState.settings, {
          "reaction-auth-net": update
        })
      };
    });
  }

  /**
   * @name handleSelectChange()
   * @summary Handle iselct option chnage
   * @param {Boolean} value - value of select option
   * @param {String} name - name of select field
   * @return {function} state for field value
  */
  handleSelectChange(value, name) {
    const settings = {};
    settings[name] = value;
    this.setState((prevState) => {
      return {
        settings: Object.assign({}, prevState.settings, settings)
      };
    });
  }

  /**
   * @name renderModeOptions()
   * @summary render select field for mode options on Authnet
   * @return {JSX} template containing Authnet mode options
  */
  renderModeOptions() {
    const options = [
      { value: true, label: "Live - Production Mode" },
      { value: false, label: "Test - Sandbox Mode" }
    ];

    const { settings } = this.state;

    return (
      <Components.Select
        i18nKeyLabel={"Mode"}
        i18nKeyPlaceholder={"(Select One)"}
        label={"Mode"}
        name={"mode"}
        onChange={this.handleSelectChange}
        options={options}
        placeholder={"(Select One)"}
        value={settings.mode}
      />
    );
  }

  /**
   * @name renderSupportedMethods()
   * @summary render checkboxes for supported methods on Authnet
   * @return {JSX} template containing supported method checkboxes
  */
  renderSupportedMethods() {
    const { configSchema, settings } = this.state;
    if (settings["reaction-auth-net"]) {
      const { label } = configSchema._schema["settings.reaction-auth-net.support"];
      const { allowedValues } = configSchema._schema["settings.reaction-auth-net.support.$"];
      const { support } = settings["reaction-auth-net"];

      return (
        <div>
          <span>{ label }</span>
          {
            allowedValues.map((option) => {
              return (
                <div key={`${option} support`} className="checkbox">
                  <Components.Checkbox
                    checked={support.includes(option)}
                    i18nKeyLabel={option}
                    label={option}
                    name={option}
                    onChange={this.handleCheckboxSelect}
                  />
                </div>
              );
            })
          }
        </div>
      );
    }
  }

  /**
    * renderComponent
    * @method render()
    * @summary React component for displaying Authnet form
    * @param {Object} props - React PropTypes
    * @property {Object} configSchema - Authnet schema
    * @property {Object} settings - Authnet settings
    * @return {Node} React node containing form view
  */
  render() {
    const { configSchema, settings } = this.state;
    const { shownFields, hiddenFields, handleSubmit } = this.props;
    return (
      <div>
        {this.renderSupportedMethods()}
        {this.renderModeOptions()}
        <Form
          schema={configSchema}
          doc={settings}
          docPath={"settings"}
          name={"settings"}
          fields={shownFields}
          hideFields={hiddenFields}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }
}

/**
  * @name AuthnetSettingsForm propTypes
  * @type {propTypes}
  * @param {Object} props - React PropTypes
  * @property {Function} handleSubmit - a function that saves new Authnet settings.
  * @property {Array} hiddenFields - an array of the Authnet Package's fields
  * to hide from the settings form.
  * @property {Object} settings - the value of the "settings" field in the Authnet Package.
  * @property {Object} shownFields - info about the fields of the Authnet
  * Package that the settings form will allow users to change.
  * @return {Array} React propTypes
*/
AuthnetSettingsForm.propTypes = {
  handleSubmit: PropTypes.func,
  hiddenFields: PropTypes.arrayOf(PropTypes.string),
  schema: PropTypes.object,
  settings: PropTypes.object,
  shownFields: PropTypes.object
};

export default AuthnetSettingsForm;
