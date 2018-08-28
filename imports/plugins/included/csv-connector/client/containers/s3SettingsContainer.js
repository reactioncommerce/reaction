import React, { Component } from "react";
import { compose } from "recompose";
import Alert from "sweetalert2";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { S3Settings } from "../components";

const wrapComponent = (Comp) => (
  class S3SettingsContainer extends Component {
    handleSubmit = (values) => {
      Meteor.call("csvConnector/updateS3Settings", values, (error) => {
        if (error) {
          Alert(i18next.t("app.error"), error.message, "error");
        }
      });
      Alert(i18next.t("app.success"), i18next.t("admin.alerts.s3SettingsSaved"), "success");
    }

    render() {
      return (
        <Comp
          onSubmit={this.handleSubmit}
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
