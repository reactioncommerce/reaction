import React, { Component, PropTypes } from "react";
import { Button, Card, CardHeader, CardBody, CardGroup, FieldGroup, TextField } from "/imports/plugins/core/ui/client/components";

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
      <CardGroup>
        <Card
          expanded={true}
        >
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle="sms.headers.settings"
            title="SMS Provider"
          />
          <CardBody expandable={true}>
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
              <TextField
                label="Sms Phone Number"
                type="text"
                i18nKeyLabel="sms.settings.smsPhone"
                name="smsPhone"
                value={settings.smsPhone || ""}
                onChange={this.handleStateChange}
              />
              <TextField
                label="API Key"
                type="password"
                i18nKeyLabel="sms.settings.apiKey"
                name="apiKey"
                value={settings.apiKey || ""}
                onChange={this.handleStateChange}
              />
              <TextField
                label="API Token/Secret"
                type="password"
                i18nKeyLabel="sms.settings.apiToken"
                name="apiToken"
                value={settings.apiToken || ""}
                onChange={this.handleStateChange}
              />
              <Button
                bezelStyle="solid"
                status="primary"
                className="pull-right"
                type="submit" disabled={isSaving}
              >
                {isSaving ?
                    <i className="fa fa-refresh fa-spin"/>
                  : <span data-i18n="app.save">Save</span>}
              </Button>
            </form>
          </CardBody>
        </Card>
      </CardGroup>
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
