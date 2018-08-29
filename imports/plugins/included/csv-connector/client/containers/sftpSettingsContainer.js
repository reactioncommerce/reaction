import React, { Component } from "react";
import { compose } from "recompose";
import Alert from "sweetalert2";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { SFTPSettings } from "../components";

const wrapComponent = (Comp) => (
  class SFTPSettingsContainer extends Component {
    handleSubmit = (values) => {
      Meteor.call("csvConnector/updateSFTPSettings", values, (error) => {
        if (error) {
          return Alert(i18next.t("app.error"), error.message, "error");
        }
        return Alert(i18next.t("app.success"), i18next.t("admin.alerts.sftpSettingsSaved"), "success");
      });
    }

    handleTestForImportAndExport = () => {
      Meteor.call("csvConnector/sftpTestForImportAndExport", (error) => {
        if (error) {
          return Alert(i18next.t("app.error"), i18next.t("admin.alerts.sftpCredentialsInvalid"), "error");
        }
        return Alert(i18next.t("app.success"), i18next.t("admin.alerts.sftpSettingsValid"), "success");
      });
    }

    render() {
      return (
        <Comp
          onSubmit={this.handleSubmit}
          onTestForImportAndExport={this.handleTestForImportAndExport}
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
