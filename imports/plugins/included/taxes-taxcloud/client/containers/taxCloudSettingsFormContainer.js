import React, { Component } from "react";
import PropTypes from "prop-types";
import { composeWithTracker, registerComponent } from  "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { TaxCloudPackageConfig } from "../../lib/collections/schemas";
import { TaxCloudSettingsForm } from "../components";

/**
 * @file TaxCloudSettingsFormContainer is a React Component that serves
 * as a container for TaxCloudSettingsForm.
 * @module TaxCloudSettingsFormContainer
 * @extends Component
 */

class TaxCloudSettingsFormContainer extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
    * handleSubmit
    * @method
    * @summary event handler for when new TaxCloud settings are submitted.
    * @param {Object} event - event info.
    * @param {Object} changedInfo - info about the new TaxCloud settings.
    * @param {String} targetField - where to save the new settings in the TaxCloud Package.
    * @property {String} packageName - the name of this tax provider in lowercase.
    * @since 1.5.2
    * @return {null} - returns nothing
    */
  handleSubmit(event, changedInfo, targetField) {
    if (!changedInfo.isValid) {
      return;
    }
    Meteor.call("package/update", this.props.packageName, targetField, changedInfo.doc.settings.taxcloud, (error) => {
      if (error) {
        Alerts.toast(
          i18next.t("admin.update.updateFailed", { defaultValue: "Failed to update TaxCloud settings." }),
          "error"
        );
        return;
      }
      Alerts.toast(
        i18next.t("admin.update.updateSucceeded", { defaultValue: "TaxCloud settings updated." }),
        "success"
      );
    });
  }

  render() {
    const providerName = this.props.providerName;
    const packageSettings = this.props.settings;
    const shownFields = {
      [`settings.${providerName}.apiKey`]: TaxCloudPackageConfig._schema[`settings.${providerName}.apiKey`],
      [`settings.${providerName}.apiLoginId`]: TaxCloudPackageConfig._schema[`settings.${providerName}.apiLoginId`]
    };
    const hiddenFields = [
      `settings.${providerName}.enabled`,
      `settings.${providerName}.refreshPeriod`,
      `settings.${providerName}.taxCodeUrl`
    ];

    return (
      <div>
        {!packageSettings.taxcloud.apiLoginId &&
          <div className="alert alert-info">
            <span data-i18n="admin.taxSettings.taxcloudCredentials">Add API Login ID to enable</span>
            <a href="https://www.taxcloud.com/" target="_blank">TaxCloud</a>
          </div>
        }
        <TaxCloudSettingsForm
          schema={TaxCloudPackageConfig}
          doc={{ settings: packageSettings }}
          docPath={`settings.${providerName}`}
          name={`settings.${providerName}`}
          fields={shownFields}
          hideFields={hiddenFields}
          handleSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}

/**
  * @name TaxCloudSettingsFormContainer propTypes
  * @type {propTypes}
  * @param {Object} props - React PropTypes
  * @property {String} packageName - the value of the "name" field in the TaxCloud Package.
  * @property {String} providerName - the name of this provider in lowercase i.e "taxcloud".
  * @property {Object} settings - the value of the "settings" field in the TaxCloud Package.
  * @return {Array} React propTypes
  */
TaxCloudSettingsFormContainer.propTypes = {
  packageName: PropTypes.string,
  providerName: PropTypes.string,
  settings: PropTypes.object
};

const composer = (props, onData) => {
  const shopId = Reaction.getShopId();
  const packageSub = Meteor.subscribe("Packages", shopId);
  if (packageSub.ready()) {
    const providerName = "taxcloud";
    const packageName = "taxes-taxcloud";
    const packageData = Reaction.getPackageSettings(packageName);
    onData(null, { ...packageData, packageName, providerName });
  }
};

registerComponent("TaxCloudSettingsFormContainer", TaxCloudSettingsFormContainer, composeWithTracker(composer));

export default composeWithTracker(composer)(TaxCloudSettingsFormContainer);
