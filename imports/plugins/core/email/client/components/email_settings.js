import React, { Component, PropTypes } from "react";
import { Panel, Button } from "react-bootstrap";
import { FieldGroup } from "/imports/plugins/core/ui/client/components";

class EmailSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings
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
    saveSettings(settings);
  }

  render() {
    const { providers } = this.props;
    const { settings } = this.state;

    return (
      <Panel header={<h3 data-i18n="shopSettings.mail">Mail Provider</h3>}>
        <form onSubmit={this.handleSubmit}>
          <FieldGroup
            label="Service"
            componentClass="select"
            name="service"
            value={settings.service}
            onChange={this.handleStateChange}>
            <option value="">Select a Service...</option>
            <option value="custom">Custom</option>
            {providers.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </FieldGroup>
          <hr/>
          {settings.service === "custom" &&
            <div>
              <FieldGroup
                label="Host"
                type="text"
                name="host"
                value={settings.host}
                onChange={this.handleStateChange}/>
              <FieldGroup
                label="Port"
                type="text"
                name="port"
                value={settings.port}
                onChange={this.handleStateChange}/>
            </div>}
          <FieldGroup
            label="User"
            type="text"
            name="user"
            value={settings.user}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label="Password"
            type="password"
            name="password"
            value={settings.password}
            onChange={this.handleStateChange}/>
          <Button bsStyle="primary" className="pull-right" type="submit">
            Save
          </Button>
        </form>
      </Panel>
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
