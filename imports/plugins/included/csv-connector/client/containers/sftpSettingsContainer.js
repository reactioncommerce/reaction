import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import SimpleSchema from "simpl-schema";
import Alert from "sweetalert2";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { SFTPSettings } from "../components";

const SFTPSettingsFormSchema = new SimpleSchema({
  ipAddress: String,
  port: Number,
  username: String,
  password: String
});

const SFTPSettingsValidator = SFTPSettingsFormSchema.getFormValidator();

const wrapComponent = (Comp) => (
  class SFTPSettingsContainer extends Component {
    static propTypes = {
      pkg: PropTypes.object
    }

    handleFormValidate = (values) => SFTPSettingsValidator(SFTPSettingsFormSchema.clean(values));

    handleSubmit = (values) => {
      Meteor.call("csvConnector/updateSFTPSettings", values, (error) => {
        if (error) {
          return Alert(i18next.t("app.error"), error.message, "error");
        }
        return Alert(i18next.t("app.success"), i18next.t("admin.alerts.sftpCredentialsSaved"), "success");
      });
    }

    handleTestForImportAndExport = () => {
      Meteor.call("csvConnector/sftpTestForImportAndExport", (error) => {
        if (error) {
          return Alert(i18next.t("app.error"), i18next.t("admin.alerts.sftpCredentialsInvalid"), "error");
        }
        return Alert(i18next.t("app.success"), i18next.t("admin.alerts.sftpCredentialsValid"), "success");
      });
    }

    render() {
      const { pkg: { settings } } = this.props;

      SFTPSettingsFormSchema.labels({
        ipAddress: i18next.t("admin.dashboard.sftpIPAddress"),
        port: i18next.t("admin.dashboard.sftpPort"),
        username: i18next.t("admin.dashboard.sftpUsername"),
        password: i18next.t("admin.dashboard.sftpPassword")
      });

      return (
        <Comp
          onSubmit={this.handleSubmit}
          onTestForImportAndExport={this.handleTestForImportAndExport}
          validator={this.handleFormValidate}
          values={settings}
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
    const pkg = Packages.findOne({ shopId, name: "connector-settings-sftp" });
    onData(null, { pkg, ...props });
  }
};

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(SFTPSettings);
