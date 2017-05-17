import React, { Component, PropTypes } from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker } from "/lib/api/compose";
import { Packages } from "/lib/collections";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import { Reaction, i18next } from "/client/api";
import { ExampleSettingsForm } from "../components";

class ExampleSettingsFormContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiKey: "278302390293"
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.saveUpdate = this.saveUpdate.bind(this);
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({ apiKey: e.target.value });
  }

  handleSubmit(settings) {
    // e.preventDefault();

    const packageId = this.props.packageData._id;
    const settingsKey = this.props.packageData.registry[0].settingsKey;

    const fields = [{
      property: "apiKey",
      value: settings.apiKey
    }, {
      property: "support",
      value: settings.support
    }];

    this.saveUpdate(fields, packageId, settingsKey);
  }

  saveUpdate(fields, id, settingsKey) {
    Meteor.call("registry/update", id, settingsKey, fields, (err) => {
      if (err) {
        return Alerts.toast(i18next.t("admin.settings.saveFailed"), "error");
      }
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    });
  }

  render() {
    const settingsKey = this.props.packageData.registry[0].settingsKey;
    return (
      <TranslationProvider>
        <ExampleSettingsForm
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
          settings={this.props.packageData.settings[settingsKey]}
        />
      </TranslationProvider>
    );
  }
}

ExampleSettingsFormContainer.propTypes = {
  packageData: PropTypes.object
};

const composer = ({}, onData) => {
  const subscription = Meteor.subscribe("Packages");
  if (subscription.ready()) {
    const packageData = Packages.findOne({
      name: "example-paymentmethod",
      shopId: Reaction.getShopId()
    });
    onData(null, { packageData });
  }
};

export default composeWithTracker(composer, Loading)(ExampleSettingsFormContainer);
