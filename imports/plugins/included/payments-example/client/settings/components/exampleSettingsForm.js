import React, { Component, PropTypes } from "react";
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
        "authorize": _.includes(props.settings.support, "authorize"),
        "de-authorize": _.includes(props.settings.support, "de-authorize"),
        "capture": _.includes(props.settings.support, "capture"),
        "refund": _.includes(props.settings.support, "refund")
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
    this.setState({ checkbox });
    if (!_.includes(settings.support, name) && isInputChecked) {
      settings.support.push(name);
      return this.setState({ settings });
    }
    const index = settings.support.indexOf(name);
    settings.support.splice(index, 1);
    return this.setState({ settings });
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
              label="authorize"
              onChange={this.handleCheckBox}
              name="authorize"
              checked={this.state.checkbox.authorize}
            />
          </div>

          <div>
            <Checkbox
              label="de-authorize"
              onChange={this.handleCheckBox}
              name="de-authorize"
              checked={this.state.checkbox["de-authorize"]}
            />
          </div>

          <div>
            <Checkbox
              label="capture"
              onChange={this.handleCheckBox}
              name="capture"
              checked={this.state.checkbox.capture}
            />
          </div>

          <div>
            <Checkbox
              label="refund"
              onChange={this.handleCheckBox}
              name="refund"
              checked={this.state.checkbox.refund}
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
