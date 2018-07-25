import React, { Component } from "react";
import PropTypes from "prop-types";
import { getFieldMatchingRelevantData } from "@reactioncommerce/reaction-import-connectors";
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
    const { importJob: { hasHeader } } = this.props;
    const promise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(csvFile);
      reader.onload = () => {
        if (reader.result) {
          resolve(getFieldMatchingRelevantData(reader.result, hasHeader));
        } else {
          reject(Error("Failed reading CSV to text."));
        }
      };
    });
    promise.then((result) => {
      this.setState({
        csvFile,
        header: result.header,
        sampleData: result.sampleData
      });
      return;
    }).catch((err) => {
      throw err;
    });
  }

  renderActiveScreen() {
    const { impCollOptions, importJob, importMappings, onImportJobFieldSave, selectedMapping } = this.props;
    const { activeScreen, header, sampleData } = this.state;
    if (activeScreen === "initial") {
      return (
        <InitialScreen
          onFileUpload={this.handleFileUpload}
          importJob={importJob}
          impCollOptions={impCollOptions}
          importMappings={importMappings}
          onChangeActiveScreen={this.onChangeActiveScreen}
          onImportJobFieldSave={onImportJobFieldSave}
        />
      );
    } else if (activeScreen === "mapping") {
      return (
        <MappingScreen
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

  render() {
    return (
      <div className="container">
        {this.renderActiveScreen()}
      </div>
    );
  }
}

CSVImportAdmin.propTypes = {
  impCollOptions: PropTypes.arrayOf(PropTypes.object),
  importJob: PropTypes.object,
  importMappings: PropTypes.arrayOf(PropTypes.object),
  onImportJobFieldSave: PropTypes.func,
  selectedMapping: PropTypes.object
};

export default CSVImportAdmin;
