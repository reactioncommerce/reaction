import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { getImportableCollectionsOptions } from "@reactioncommerce/reaction-import-connectors";
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
    const impCollOptions = getImportableCollectionsOptions();
    const shopId = Reaction.getShopId();
    const importJob = ImportJobs.findOne({ shopId, status: "New" });
    const importMappings = ImportMappings.find({ shopId }).fetch();
    return onData(null, {
      impCollOptions,
      importJob,
      importMappings
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
