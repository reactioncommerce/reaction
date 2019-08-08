import React, { Component } from "react";
import PropTypes from "prop-types";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
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

  handleChange(event) {
    event.preventDefault();
    this.setState({ apiKey: event.target.value });
  }

  handleSubmit(settings) {
    const packageId = this.props.packageData._id;
    const { settingsKey } = this.props.packageData.registry[0];

    const fields = [{
      property: "apiKey",
      value: settings.apiKey
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
    return (
      <ExampleSettingsForm
        onChange={this.handleChange}
        onSubmit={this.handleSubmit}
        settings={this.props.packageData.settings}
      />
    );
  }
}

ExampleSettingsFormContainer.propTypes = {
  packageData: PropTypes.object
};

const composer = (props, onData) => {
  const subscription = Meteor.subscribe("Packages", Reaction.getShopId());
  if (subscription.ready()) {
    const packageData = Packages.findOne({
      name: "example-paymentmethod",
      shopId: Reaction.getShopId()
    });
    onData(null, { packageData });
  }
};

export default composeWithTracker(composer)(ExampleSettingsFormContainer);
