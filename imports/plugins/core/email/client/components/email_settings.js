import React, { Component, PropTypes } from "react";
import { Panel, Button } from "react-bootstrap";
import { FieldGroup } from "/imports/plugins/core/ui/client/components";

class EmailSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings,
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
    const { providers } = this.props;
    const { settings, isSaving } = this.state;

    return (
      <Panel header={<h3 data-i18n="mail.headers.settings">Mail Provider</h3>}>
        <form onSubmit={this.handleSubmit}>
          <FieldGroup
            label="Service"
            componentClass="select"
            name="service"
            value={settings.service}
            onChange={this.handleStateChange}>
            <option value="" data-i18n="mail.settings.selectService">Select a Service...</option>
            <option value="custom" data-i18n="mail.settings.custom">Custom</option>
            {providers.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </FieldGroup>
          <hr/>
          {settings.service === "custom" &&
            <div>
              <FieldGroup
                label="Host"
                i18n="mail.settings.host"
                type="text"
                name="host"
                value={settings.host}
                onChange={this.handleStateChange}/>
              <FieldGroup
                label="Port"
                i18n="mail.settings.port"
                type="text"
                name="port"
                value={settings.port}
                onChange={this.handleStateChange}/>
            </div>}
          <FieldGroup
            label="User"
            i18n="mail.settings.user"
            type="text"
            name="user"
            value={settings.user}
            onChange={this.handleStateChange}/>
          <FieldGroup
            label="Password"
            i18n="mail.settings.password"
            type="password"
            name="password"
            value={settings.password}
            onChange={this.handleStateChange}/>
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
