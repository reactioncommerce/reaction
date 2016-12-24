import React, { Component, PropTypes } from "react";
import { Panel, Button } from "react-bootstrap";
import { FieldGroup } from "/imports/plugins/core/ui/client/components";

class SmsSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings || {},
      isSaving: false
    };
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleStateChange(e) {
    const { settings } = this.state;
    settings[e.target.name] = e.target.value;
    this.setState({ settings });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { saveSettings } = this.props;
    const { settings } = this.state;
    this.setState({ isSaving: true });
    saveSettings(settings, () => this.setState({ isSaving: false }));
  }

  render() {
    const settings = this.state.settings;
    const isSaving = this.state.isSaving;
    return (
       <Panel header={<h3 data-i18n="sms.headers.settings">SMS Provider</h3>}>
        <form onSubmit={this.handleSubmit}>
          <FieldGroup
            label="Provider"
            componentClass="select"
            i18n="sms.settings.provider"
            name="smsProvider"
            value={settings.smsProvider || ""}
            onChange={this.handleStateChange}
          >
              <option value="" data-i18n="sms.settings.selectProvider">Select an SMS provider...</option>
              <option value="twilio">Twilio</option>
              <option value="nexmo">Nexmo</option>
          </FieldGroup>
          <hr/>
          <FieldGroup
            label="Sms Phone Number"
            type="text"
            i18n="sms.settings.smsPhone"
            name="smsPhone"
            value={settings.smsPhone || ""}
            onChange={this.handleStateChange}
          />
          <FieldGroup
            label="API Key"
            type="password"
            i18n="sms.settings.apiKey"
            name="apiKey"
            value={settings.apiKey || ""}
            onChange={this.handleStateChange}
          />
          <FieldGroup
            label="API Token/Secret"
            type="password"
            i18n="sms.settings.apiToken"
            name="apiToken"
            value={settings.apiToken || ""}
            onChange={this.handleStateChange}
          />
          <Button bsStyle="primary" className="pull-right" type="submit" disabled={isSaving}>
            {isSaving ?
                <i className="fa fa-refresh fa-spin"/>
              : <span data-i18n="app.save">Save</span>}
          </Button>
        </form>
      </Panel>
    );
  }
}

SmsSettings.propTypes = {
  saveSettings: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    apiKey: PropTypes.string,
    apiToken: PropTypes.string,
    smsPhone: PropTypes.string,
    smsProvider: PropTypes.string
  })
};

export default SmsSettings;
