import { composeWithTracker } from "/lib/api/compose";
import { ExampleSettingsForm } from "../components";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";

import Alert from "sweetalert2";
import { Reaction, i18next } from "/client/api";

import React, { Component, PropTypes } from "react";

class ExampleSettingsFormContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiKey: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.saveUpdate = this.saveUpdate.bind(this);
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({ apiKey: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();

    const packageId = this.props.packageData._id;
    const settingsKey = this.props.packageData.registry[0].settingsKey;
    const apiKey = this.state.apiKey;

    const fields = [{
      property: "apiKey",
      value: apiKey
    }];

    this.saveUpdate(fields, packageId, settingsKey);
  }

  saveUpdate(fields, id, settingsKey) {
    Meteor.call("registry/update", id, settingsKey, fields, (err) => {
      if (err) {
        return Alert({
          text: i18next.t("admin.settings.saveFailed"),
          type: "warning",
          options: {
            autoHide: 4000
          }
        });
      }
      return Alert({
        text: i18next.t("admin.settings.saveSuccess"),
        type: "success"
      });
    });
  }

  render() {
    return (
      <TranslationProvider>
        <ExampleSettingsForm

          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
          packageData={this.props.packageData}
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
