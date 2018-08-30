import React, { Component } from "react";
import Alert from "sweetalert2";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";

class SFTPSettings extends Component {
  handleSubmit = (event) => {
    event.preventDefault();
    this.props.onSubmit();
  }

  handleTestForImportAndExport = () => {
    this.props.onTestForImportAndExport();
  }

  handleFieldChange = (event, value, field) => {
    this.props.onFieldChange(value, field);
  }

  render() {
    const { currentPkg: pkg } = this.props;
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
  currentPkg: PropTypes.object,
  onFieldChange: PropTypes.func,
  onSubmit: PropTypes.func,
  onTestForImportAndExport: PropTypes.func
};

export default SFTPSettings;
