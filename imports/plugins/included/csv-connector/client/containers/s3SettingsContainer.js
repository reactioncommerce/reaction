import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import Alert from "sweetalert2";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { S3Settings } from "../components";

const wrapComponent = (Comp) => (
  class S3SettingsContainer extends Component {
    static propTypes = {
      pkg: PropTypes.object
    }

    constructor(props) {
      super(props);
      this.state = {
        currentPkg: props.pkg
      };
    }

    handleFieldChange = (value, field) => {
      const { currentPkg } = this.state;
      const newSettings = {};
      newSettings[field] = value;
      const newPkg = {
        ...currentPkg,
        settings: {
          ...currentPkg.settings,
          ...newSettings
        }
      };
      this.setState({ currentPkg: newPkg });
    }

    handleSubmit = () => {
      const { currentPkg: { settings: { accessKey, secretAccessKey, bucket } } } = this.state;
      const values = { accessKey, bucket, secretAccessKey };
      Meteor.call("csvConnector/updateS3Settings", values, (error) => {
        if (error) {
          return Alert(i18next.t("app.error"), error.message, "error");
        }
        return Alert(i18next.t("app.success"), i18next.t("admin.alerts.s3SettingsSaved"), "success");
      });
    }

    handleTestForExport = () => {
      Meteor.call("csvConnector/s3TestForExport", (error) => {
        if (error) {
          return Alert(i18next.t("app.error"), i18next.t("admin.alerts.s3CredentialsInvalidForExport"), "error");
        }
        return Alert(i18next.t("app.success"), i18next.t("admin.alerts.s3SettingsValid"), "success");
      });
    }

    handleTestForImport = () => {
      Meteor.call("csvConnector/s3TestForImport", (error) => {
        if (error) {
          return Alert(i18next.t("app.error"), i18next.t("admin.alerts.s3CredentialsInvalidForImport"), "error");
        }
        return Alert(i18next.t("app.success"), i18next.t("admin.alerts.s3SettingsValid"), "success");
      });
    }

    render() {
      const { currentPkg } = this.state;
      return (
        <Comp
          currentPkg={currentPkg}
          onFieldChange={this.handleFieldChange}
          onSubmit={this.handleSubmit}
          onTestForImport={this.handleTestForImport}
          onTestForExport={this.handleTestForExport}
          {...this.props}
        />
      );
    }
  }
);

const composer = (props, onData) => {
  const shopId = Reaction.getShopId();
  const packageSub = Meteor.subscribe("Packages", shopId);
  if (packageSub.ready()) {
    const pkg = Packages.findOne({ shopId, name: "connector-settings-aws-s3" });
    onData(null, { pkg, ...props });
  }
};

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(S3Settings);
