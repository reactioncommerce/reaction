import React, { Component, PropTypes } from "react";
import { Button, Select, TextField } from "/imports/plugins/core/ui/client/components";

class EmailSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings,
      isSaving: false
    };

    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
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

  handleSelect(e) {
    const { settings } = this.state;
    settings.service = e;
    this.setState({ settings });
  }

  render() {
    const { providers } = this.props;
    const { settings, isSaving } = this.state;

    const emailProviders = providers.map((name) => (
      { label: name, value: name }
    ));

    emailProviders.unshift({ label: "Custom", value: "custom" });

    return (
      <form onSubmit={this.handleSubmit}>
        <Select
          clearable={false}
          label="Service"
          i18nKeyLabel="admin.settings.providerName"
          placeholder="Select a Service"
          i18nKeyPlaceholder="mail.settings.selectService"
          name="service"
          onChange={this.handleSelect}
          options={emailProviders}
          value={settings.service || ""}
        />
        {settings.service === "custom" &&
          <div>
            <TextField
              label="Host"
              i18nKeyLabel="mail.settings.host"
              type="text"
              name="host"
              value={settings.host}
              onChange={this.handleStateChange}
            />
          <TextField
            label="Port"
            i18nKeyLabel="mail.settings.port"
            type="text"
            name="port"
            value={settings.port}
            onChange={this.handleStateChange}
          />
          </div>
        }
        <TextField
          label="User"
          i18nKeyLabel="mail.settings.user"
          type="text"
          name="user"
          value={settings.user}
          onChange={this.handleStateChange}
        />
        <TextField
          label="Password"
          i18nKeyLabel="mail.settings.password"
          type="password"
          name="password"
          value={settings.password}
          onChange={this.handleStateChange}
        />
        <Button
          primary={true}
          bezelStyle="solid"
          className="pull-right"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ?
              <i className="fa fa-refresh fa-spin"/>
            : <span data-i18n="app.save">Save</span>}
        </Button>
      </form>
    );
  }
}

EmailSettings.propTypes = {
  providers: PropTypes.arrayOf(PropTypes.string).isRequired,
  saveSettings: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    service: PropTypes.string,
    host: PropTypes.string,
    port: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    user: PropTypes.string,
    password: PropTypes.string
  })
};

export default EmailSettings;
