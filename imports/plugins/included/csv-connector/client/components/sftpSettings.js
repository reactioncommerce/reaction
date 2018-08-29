import React, { Component } from "react";
import Alert from "sweetalert2";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";

class SFTPSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pkg: props.pkg
    };
  }

  handleSubmit = (event) => {
    const { onSubmit } = this.props;
    event.preventDefault();
    const { pkg: { settings: { ipAddress, port, username, password } } } = this.state;

    const numPort = Number(port);

    if (isNaN(numPort)) {
      Alert(i18next.t("app.error"), i18next.t("admin.alerts.portNaN"), "error");
      return;
    }

    onSubmit({
      ipAddress,
      port: numPort,
      username,
      password
    });
  }

  handleTestForImportAndExport = () => {
    this.props.onTestForImportAndExport();
  }

  handleFieldChange = (event, value, field) => {
    const { pkg } = this.state;
    const newSettings = {};
    newSettings[field] = value;
    const newPkg = {
      ...pkg,
      settings: {
        ...pkg.settings,
        ...newSettings
      }
    };
    this.setState({ pkg: newPkg });
  }

  render() {
    const { pkg } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="row" style={{ margin: "20px 0" }}>
          <p>SFTP Settings</p>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8">
            <Components.TextField
              i18nKeyLabel="admin.dashboard.sftpIPAddress"
              label="IP Address"
              name="ipAddress"
              onChange={this.handleFieldChange}
              placeholder="111.111.111.111"
              ref="ipAddressInput"
              value={pkg.settings.ipAddress}
            />
          </div>
          <div className="col-sm-12 col-md-4">
            <Components.TextField
              i18nKeyLabel="admin.dashboard.sftpPort"
              label="Port"
              name="port"
              onChange={this.handleFieldChange}
              placeholder="22"
              ref="portInput"
              value={pkg.settings.port}
            />
          </div>
          <div className="col-md-12">
            <Components.TextField
              i18nKeyLabel="admin.dashboard.sftpUsername"
              label="Username"
              name="username"
              onChange={this.handleFieldChange}
              ref="portInput"
              value={pkg.settings.username}
            />
          </div>
          <div className="col-md-12">
            <Components.TextField
              i18nKeyLabel="admin.dashboard.sftpPassword"
              label="Password"
              name="password"
              type="password"
              onChange={this.handleFieldChange}
              ref="passwordInput"
              value={pkg.settings.password}
            />
          </div>
        </div>
        <div className="row" style={{ margin: "20px 0" }}>
          <Components.Button
            className="btn btn-primary"
            bezelStyle="solid"
            buttonType="submit"
            onClick={this.handleSave}
            i18nKeyLabel="admin.dashboard.save"
            label="Save Changes"
          />
        </div>
        <div className="row">
          <Components.Button
            className="btn btn-default"
            bezelStyle="solid"
            onClick={this.handleTestForImportAndExport}
            i18nKeyLabel="admin.dashboard.sftpTest"
            label="Test For Import and Export"
          />
        </div>
      </form>
    );
  }
}

SFTPSettings.propTypes = {
  onSubmit: PropTypes.func,
  onTestForImportAndExport: PropTypes.func,
  pkg: PropTypes.object
};

export default SFTPSettings;
