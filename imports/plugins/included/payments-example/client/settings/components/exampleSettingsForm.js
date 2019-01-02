import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { TextField, Translation } from "/imports/plugins/core/ui/client/components";

class ExampleSettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {
        apiKey: props.settings.apiKey
      }
    };
  }

  handleStateChange = (e) => {
    const { settings } = this.state;
    settings[e.target.name] = e.target.value;
    this.setState({ settings });
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
