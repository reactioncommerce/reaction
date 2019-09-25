import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class SMTPEmailSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings,
      hasAuth: !(props.settings.service === "Maildev"),
      isSaving: false
    };

    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleStateChange(event) {
    const { settings } = this.state;
    settings[event.target.name] = event.target.value;
    this.setState({ settings });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { client, saveSettings, providers } = this.props;
    const { settings } = this.state;
    let newSettings = settings;
    if (settings.service !== "custom") {
      newSettings = Object.assign({}, settings, providers[settings.service]);
    }
    this.setState({ isSaving: true });
    saveSettings(newSettings, client, () => this.setState({ isSaving: false }));
  }

  handleSelect(service) {
    this.setState({ settings: { service }, hasAuth: !(service === "Maildev") });
  }

  render() {
    const { providers } = this.props;
    const { settings, hasAuth, isSaving } = this.state;

    const providerNames = Object.keys(providers);

    const emailProviders = providerNames.map((name) => (
      { label: name, value: name }
    ));

    emailProviders.unshift({ label: "Custom", value: "custom" });

    return (
      <form onSubmit={this.handleSubmit}>
        <Components.Select
          clearable={false}
          label="Service"
          i18nKeyLabel="admin.settings.providerName"
          placeholder="Select a Service"
          i18nKeyPlaceholder="admin.settings.selectService"
          name="service"
          onChange={this.handleSelect}
          options={emailProviders}
          value={settings.service || ""}
        />
        {settings.service === "custom" &&
          <div>
            <Components.TextField
              label="Host"
              i18nKeyLabel="admin.settings.host"
              type="text"
              name="host"
              value={settings.host}
              onChange={this.handleStateChange}
            />
            <Components.TextField
              label="Port"
              i18nKeyLabel="admin.settings.port"
              type="text"
              name="port"
              value={settings.port}
              onChange={this.handleStateChange}
            />
          </div>
        }
        {hasAuth &&
          <div>
            <Components.TextField
              label="User"
              i18nKeyLabel="admin.settings.user"
              type="text"
              name="user"
              value={settings.user}
              onChange={this.handleStateChange}
            />
            <Components.TextField
              label="Password"
              i18nKeyLabel="admin.settings.password"
              type="password"
              name="password"
              value={settings.password}
              onChange={this.handleStateChange}
            />
          </div>
        }
        <Components.Button
          primary={true}
          bezelStyle="solid"
          className="pull-right"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ?
            <i className="fa fa-refresh fa-spin"/>
            : <span data-i18n="app.save">Save</span>}
        </Components.Button>
      </form>
    );
  }
}

SMTPEmailSettings.propTypes = {
  client: PropTypes.object.isRequired,
  providers: PropTypes.object.isRequired,
  saveSettings: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    service: PropTypes.string,
    host: PropTypes.string,
    port: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    user: PropTypes.string,
    password: PropTypes.string
  })
};

export default SMTPEmailSettings;
