import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class S3Settings extends Component {
  handleSubmit = (event) => {
    event.preventDefault();
    this.props.onSubmit();
  }

  handleTestForImport = () => {
    this.props.onTestForImport();
  }

  handleTestForExport = () => {
    this.props.onTestForExport();
  }

  handleFieldChange = (event, value, field) => {
    this.props.onFieldChange(value, field);
  }

  render() {
    const { currentPkg: pkg } = this.props;
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="row" style={{ margin: "20px 0" }}>
          <p>AWS S3 Settings</p>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Components.TextField
              i18nKeyLabel="admin.dashboard.s3AccessKey"
              label="Access Key"
              name="accessKey"
              onChange={this.handleFieldChange}
              ref="accessKeyInput"
              value={pkg.settings.accessKey}
            />
          </div>
          <div className="col-md-12">
            <Components.TextField
              i18nKeyLabel="admin.dashboard.s3SecretAccessKey"
              label="Secret Access Key"
              name="secretAccessKey"
              onChange={this.handleFieldChange}
              ref="secretAccessKeyInput"
              value={pkg.settings.secretAccessKey}
            />
          </div>
          <div className="col-md-12">
            <Components.TextField
              i18nKeyLabel="admin.dashboard.s3Bucket"
              label="Bucket"
              name="bucket"
              onChange={this.handleFieldChange}
              ref="bucketInput"
              value={pkg.settings.bucket}
            />
          </div>
        </div>
        <div className="row" style={{ margin: "20px 0" }}>
          <Components.Button
            className="btn btn-primary"
            bezelStyle="solid"
            buttonType="submit"
            i18nKeyLabel="admin.dashboard.save"
            label="Save Changes"
          />
        </div>
        <div className="row">
          <Components.Button
            className="btn btn-default"
            bezelStyle="solid"
            onClick={this.handleTestForImport}
            i18nKeyLabel="admin.dashboard.testImport"
            label="Test For Import"
            style={{ marginRight: "20px" }}
          />
          <Components.Button
            className="btn btn-default"
            bezelStyle="solid"
            onClick={this.handleTestForExport}
            i18nKeyLabel="admin.dashboard.testExport"
            label="Test For Export"
          />
        </div>
      </form>
    );
  }
}

S3Settings.propTypes = {
  currentPkg: PropTypes.object,
  onFieldChange: PropTypes.func,
  onSubmit: PropTypes.func,
  onTestForExport: PropTypes.func,
  onTestForImport: PropTypes.func
};

export default S3Settings;
