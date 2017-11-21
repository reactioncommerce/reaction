import React, { Component } from "react";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import { Reaction } from "/client/api";
import { ExportSettings } from "../components";

class ExportSettingsContainer extends Component {
  render() {
    const settingsKey = this.props.packageData.registry[0].settingsKey;
    return (
      <TranslationProvider>
        <ExportSettings
          settings={this.props.packageData.settings[settingsKey]}
          exportSettings={this.props.exportSettings}
        />
      </TranslationProvider>
    );
  }
}

ExportSettingsContainer.propTypes = {
  exportSettings: PropTypes.array,
  packageData: PropTypes.object
};

const composer = ({}, onData) => {
  const primaryShopSub = Meteor.subscribe("PrimaryShop");
  const merchantShopSub = Meteor.subscribe("MerchantShops");
  const exportSettings = Reaction.Apps({ provides: "exportSettings" });
  if (primaryShopSub.ready() && merchantShopSub.ready()) {
    const packageData = Packages.findOne({
      name: "reaction-simple-export-csv",
      shopId: Reaction.getShopId()
    });
    onData(null, { packageData, exportSettings });
  }
};

export default composeWithTracker(composer)(ExportSettingsContainer);
