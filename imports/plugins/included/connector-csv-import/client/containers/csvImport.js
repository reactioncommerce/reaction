import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { getImportableCollectionsOptions, getDefaultMappingForCollection } from "@reactioncommerce/reaction-import-connectors";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { ImportJobs, ImportMappings } from "../../lib/collections";
import { CSVImport } from "../components";

const wrapComponent = (Comp) => (
  class CSVImportContainer extends Component {
    static propTypes = {
      impCollOptions: PropTypes.arrayOf(PropTypes.object),
      importJob: PropTypes.object,
      importMappings: PropTypes.arrayOf(PropTypes.object)
    }

    handleImportJobFieldSave = (importJobId, fieldName, value) => {
      Meteor.call("importJobs/updateImportJobField", importJobId, fieldName, value, (error) => {
        if (error) {
          Alerts.toast(error.message, "error");
          this.forceUpdate();
        }
      });
    }

    render() {
      return (
        <Comp
          onImportJobFieldSave={this.handleImportJobFieldSave}
          {...this.props}
        />
      );
    }
  }
);

function composer(props, onData) {
  if (Meteor.subscribe("ImportJobs").ready() && Meteor.subscribe("ImportMappings").ready()) {
    const userId = Meteor.userId();
    const impCollOptions = getImportableCollectionsOptions();
    const shopId = Reaction.getShopId();
    const importJob = ImportJobs.findOne({ userId, shopId, status: "New" });
    const importMappings = ImportMappings.find({ shopId }).fetch();
    let selectedMapping = {}; // Mapping will be humanized column name to technical field name
    if (importJob && importJob.importMapping) {
      if (importJob.importMapping === "default") {
        selectedMapping = getDefaultMappingForCollection(importJob.collection);
      } else if (importJob.importMapping !== "create") {
        selectedMapping = ImportMappings.findOne(importJob.importMapping).mapping;
      }
    }
    return onData(null, {
      impCollOptions,
      importJob,
      importMappings,
      selectedMapping
    });
  }
}

registerComponent("CSVImport", CSVImport, [
  composeWithTracker(composer),
  wrapComponent
]);

// Decorate component and export
export default compose(
  composeWithTracker(composer),
  wrapComponent
)(CSVImport);
