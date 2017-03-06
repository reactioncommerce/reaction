import React, { Component, PropTypes } from "react";
import { TextField, Translation } from "/imports/plugins/core/ui/client/components";

class ExampleSettingsForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: {
        apiKey: ""
      }
    };

    this.handleStateChange = this.handleStateChange.bind(this);
  }

  handleStateChange(e) {
    const { settings } = this.state;
    settings[e.target.name] = e.target.value;
    this.setState({ settings });
  }


  render() {
    const { packageData } = this.props;
    const { settings } = this.state;

    return (
      <div>
        { !packageData.settings.apiKey &&
          <div className="alert alert-info">
            <Translation defaultValue="Example Credentials" i18nKey="admin.paymentSettings.exampleCredentials"/>
          </div>
        }

        <form onSubmit={this.props.onSubmit}>
          <TextField
            label="API Key"
            name="apiKey"
            type="text"
            onChange={this.handleStateChange}
            value={settings.apiKey}
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
  packageData: PropTypes.object
};

export default ExampleSettingsForm;
