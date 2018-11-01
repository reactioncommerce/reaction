import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import SimpleSchema from "simpl-schema";
import Alert from "sweetalert2";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { GoogleWebToolsSettings } from "../components";

const GoogleWebToolsSettingsFormSchema = new SimpleSchema({
  siteVerificationToken: String
});

const GoogleWebToolsSettingsValidator = GoogleWebToolsSettingsFormSchema.getFormValidator();

const wrapComponent = (Comp) => (
  class GoogleWebToolsSettingsContainer extends Component {
    static propTypes = {
      pkg: PropTypes.object
    }

    handleFormValidate = (values) => GoogleWebToolsSettingsValidator(GoogleWebToolsSettingsFormSchema.clean(values));

    handleSubmit = (values) => {
      Meteor.call("googleWebTools/updateGoogleWebToolsSettings", values, (error) => {
        if (error) {
          return Alert(i18next.t("app.error"), error.message, "error");
        }
        return Alert(i18next.t("app.success"), i18next.t("admin.alerts.siteVerificationTokenSaved"), "success");
      });
    }

    render() {
      const { pkg: { settings: { public: { siteVerificationToken } } } } = this.props;

      GoogleWebToolsSettingsFormSchema.labels({
        siteVerificationToken: i18next.t("admin.dashboard.siteVerificationToken")
      });

      return (
        <Comp
          onSubmit={this.handleSubmit}
          validator={this.handleFormValidate}
          values={{ siteVerificationToken }}
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
    const pkg = Packages.findOne({ shopId, name: "google-webtools" });
    onData(null, { pkg, ...props });
  }
};

registerComponent("GoogleWebToolsSettings", GoogleWebToolsSettings, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(GoogleWebToolsSettings);
