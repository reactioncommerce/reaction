import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { SortableTable } from "/imports/plugins/core/ui/client/components";
import { i18next } from "/client/api";
import { ImportJobs } from "../../lib/collections";
import InitialScreen from "./initialScreen";
import MappingScreen from "./mappingScreen";
import SuccessScreen from "./successScreen";

class CSVImportAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeScreen: "initial",
      csvFile: {},
      header: [],
      sampleData: []
    };
  }

  onChangeActiveScreen = (activeScreen) => {
    this.setState({ activeScreen });
  }

  handleFileUpload = (csvFile) => {
    this.setState({ csvFile });
  }

  updateHeaderAndSampleData = (header, sampleData) => {
    this.setState({ header, sampleData });
  }

  renderActiveScreen() {
    const { impCollOptions, importJob, importMappings, onImportJobFieldSave, selectedMapping } = this.props;
    const { activeScreen, csvFile, header, sampleData } = this.state;
    if (activeScreen === "initial") {
      return (
        <InitialScreen
          onFileUpload={this.handleFileUpload}
          importJob={importJob}
          impCollOptions={impCollOptions}
          importMappings={importMappings}
          onChangeActiveScreen={this.onChangeActiveScreen}
          onImportJobFieldSave={onImportJobFieldSave}
          updateHeaderAndSampleData={this.updateHeaderAndSampleData}
        />
      );
    } else if (activeScreen === "mapping") {
      return (
        <MappingScreen
          csvFile={csvFile}
          header={header}
          importJob={importJob}
          onChangeActiveScreen={this.onChangeActiveScreen}
          sampleData={sampleData}
          selectedMapping={selectedMapping}
        />
      );
    } else if (activeScreen === "success") {
      return (
        <SuccessScreen
          onChangeActiveScreen={this.onChangeActiveScreen}
        />
      );
    }
    return null;
  }

  renderImportJobsTable() {
    const customRowMetaData = {
      bodyCssClassName: () => "import-job-grid-row"
    };
    const filteredFields = ["name", "collection", "uploaded", "status"];
    const customColumnMetadata = [];
    filteredFields.forEach((field) => {
      const columnMeta = {
        accessor: field,
        Header: i18next.t(`admin.taxGrid.${field}`, `${field}`)
      };
      customColumnMetadata.push(columnMeta);
    });

    return (
      <div className="row">
        <h3>Job Queue</h3>
        <SortableTable
          publication="ImportJobs"
          collection={ImportJobs}
          columns={filteredFields}
          matchingResultsCount="import-jobs-count"
          showFilter={true}
          filteredFields={filteredFields}
          rowMetadata={customRowMetaData}
          columnMetadata={customColumnMetadata}
          externalLoadingComponent={Components.Loading}
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderActiveScreen()}
        {this.renderImportJobsTable()}
      </div>
    );
  }
}

CSVImportAdmin.propTypes = {
  impCollOptions: PropTypes.arrayOf(PropTypes.object),
  importJob: PropTypes.object,
  importJobs: PropTypes.arrayOf(PropTypes.object),
  importMappings: PropTypes.arrayOf(PropTypes.object),
  onImportJobFieldSave: PropTypes.func,
  selectedMapping: PropTypes.object
};

export default CSVImportAdmin;
