import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { TextField, Translation, Checkbox } from "/imports/plugins/core/ui/client/components";

class ExampleSettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {
        apiKey: props.settings.apiKey,
        support: props.settings.support
      },
      checkbox: {
        "Authorize": _.get(props.settings.support, "authorize"),
        "De-authorize": _.get(props.settings.support, "de_authorize"),
        "Capture": _.get(props.settings.support, "capture"),
        "Refund": _.get(props.settings.support, "refund")
      }
    };
  }

  handleStateChange = (e) => {
    const { settings } = this.state;
    settings[e.target.name] = e.target.value;
    this.setState({ settings });
  }

  handleCheckBox = (event, isInputChecked, name) => {
    const { checkbox, settings } = this.state;
    checkbox[name] = isInputChecked;
    console.log({ [name]: checkbox[name] });
    this.setState({ checkbox });
    if (!_.get(settings.support, name) && isInputChecked) {
      settings.support[name] = checkbox[name];
      return this.setState({ settings });
    }

    // const index = settings.support.indexOf(name);
    // settings.support.splice(index, 1);
    // return this.setState({ settings });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    return this.props.onSubmit(this.state.settings);
  }


  render() {
    const { settings } = this.props;
    const setting = this.state.settings;

    return (
      <div>
        { !settings.apiKey &&
          <div className="alert alert-info">
            <Translation defaultValue="Example Credentials" i18nKey="admin.paymentSettings.exampleCredentials"/>
          </div>
        }

        <form onSubmit={this.handleSubmit}>
          <TextField
            label="API Key"
            name="apiKey"
            type="text"
            onChange={this.handleStateChange}
            value={setting.apiKey}
          />

          <label className="control-label">
            <Translation defaultValue="Payment provider supported methods" i18nKey="reaction-payments.paymentSettings.supportedMethodsLabel"/>
          </label>
          <br/>

          <div>
            <Checkbox
              label="Authorize"
              onChange={this.handleCheckBox}
              name="Authorize"
              checked={this.state.checkbox.Authorize}
            />
          </div>

          <div>
            <Checkbox
              label="De-authorize"
              onChange={this.handleCheckBox}
              name="De-authorize"
              checked={this.state.checkbox["De-authorize"]}
            />
          </div>

          <div>
            <Checkbox
              label="Capture"
              onChange={this.handleCheckBox}
              name="Capture"
              checked={this.state.checkbox.Capture}
            />
          </div>

          <div>
            <Checkbox
              label="Refund"
              onChange={this.handleCheckBox}
              name="Refund"
              checked={this.state.checkbox.Refund}
            />
          </div>


          <button className="btn btn-primary pull-right" type="submit">
            <Translation defaultValue="Save Changes" i18nKey="app.saveChanges"/>
          </button>
        </form>

      </div>
    );
  }
}

ExampleSettingsForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  settings: PropTypes.object
};

export default ExampleSettingsForm;
